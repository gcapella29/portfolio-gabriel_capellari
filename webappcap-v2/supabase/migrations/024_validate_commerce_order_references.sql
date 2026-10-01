-- Follow-up migration: reject malformed, duplicate and inactive product references.
-- Prices continue to come exclusively from the published snapshot.
create or replace function public.submit_v2_commerce_order(
  p_project_id uuid,
  p_template_key text,
  p_items jsonb,
  p_customer_name text,
  p_customer_phone text
)
returns bigint
language plpgsql
security definer
set search_path=public
as $$
declare
  v_id bigint;
  v_catalog jsonb;
  v_item jsonb;
  v_product jsonb;
  v_index integer;
  v_quantity integer;
  v_name text;
  v_price_raw text;
  v_promo_total_raw text;
  v_unit_price numeric;
  v_promo_quantity integer;
  v_promo_total numeric;
  v_line_total numeric;
  v_total numeric := 0;
  v_items jsonb := '[]'::jsonb;
  v_seen integer[] := array[]::integer[];
begin
  if p_project_id is null
     or p_template_key is null
     or p_template_key not in ('commerce-main-1','commerce-modern-1','commerce-sales-1','commerce-bakery-1')
     or p_items is null
     or jsonb_typeof(p_items)<>'array'
     or nullif(btrim(p_customer_name),'') is null
     or nullif(btrim(p_customer_phone),'') is null then
    raise exception 'invalid commerce order payload';
  end if;

  if jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>1000 then
    raise exception 'invalid commerce order items';
  end if;

  if length(btrim(p_customer_name))<2
     or length(regexp_replace(p_customer_phone,'\D','','g'))<8 then
    raise exception 'invalid commerce customer';
  end if;

  select pc.content->'menu_items'
    into v_catalog
  from public.projects p
  join public.project_v2_state s on s.project_id=p.id
  join public.project_v2_public_content pc on pc.project_id=p.id
  where p.id=p_project_id
    and p.is_published=true
    and p.archived_at is null
    and s.lifecycle='published'
    and ((s.segment='food-business' and p_template_key in ('commerce-main-1','commerce-modern-1','commerce-sales-1'))
      or (s.segment='commerce' and p_template_key='commerce-bakery-1'))
    and s.template_key=p_template_key;

  if v_catalog is null or jsonb_typeof(v_catalog)<>'array' then
    raise exception 'published commerce catalog not found';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item)<>'object'
       or jsonb_typeof(v_item->'productIndex') is distinct from 'number'
       or jsonb_typeof(v_item->'quantity') is distinct from 'number'
       or (v_item->>'productIndex') !~ '^[0-9]+$'
       or (v_item->>'quantity') !~ '^[0-9]+$' then
      raise exception 'invalid commerce order item';
    end if;

    begin
      v_index := (v_item->>'productIndex')::integer;
      v_quantity := (v_item->>'quantity')::integer;
    exception when others then
      raise exception 'invalid commerce order item';
    end;

    if v_index is null or v_quantity is null or v_index=any(v_seen)
       or v_index<0 or v_index>=jsonb_array_length(v_catalog)
       or v_quantity<1 or v_quantity>999 then
      raise exception 'invalid commerce order item';
    end if;

    v_seen := array_append(v_seen,v_index);
    v_product := v_catalog->v_index;
    if v_product is null or jsonb_typeof(v_product)<>'object'
       or lower(btrim(coalesce(v_product->>'active','true')))='false' then
      raise exception 'catalog product not found';
    end if;

    v_name := nullif(btrim(v_product->>'title'),'');
    if v_name is null then
      v_name := 'Produto ' || (v_index+1);
    end if;

    v_price_raw := regexp_replace(coalesce(v_product->>'price',''),'[^0-9,.-]','','g');
    if strpos(v_price_raw,',')>0 then
      v_price_raw := replace(replace(v_price_raw,'.',''),',','.');
    end if;
    begin
      v_unit_price := greatest(0,coalesce(nullif(v_price_raw,'')::numeric,0));
    exception when others then
      v_unit_price := 0;
    end;

    begin
      v_promo_quantity := greatest(0,coalesce(nullif(v_product->>'promo_quantity','')::integer,0));
    exception when others then
      v_promo_quantity := 0;
    end;

    v_promo_total_raw := regexp_replace(coalesce(v_product->>'promo_total',''),'[^0-9,.-]','','g');
    if strpos(v_promo_total_raw,',')>0 then
      v_promo_total_raw := replace(replace(v_promo_total_raw,'.',''),',','.');
    end if;
    begin
      v_promo_total := greatest(0,coalesce(nullif(v_promo_total_raw,'')::numeric,0));
    exception when others then
      v_promo_total := 0;
    end;

    if v_promo_quantity>=2 and v_promo_total>0 and v_quantity>=v_promo_quantity then
      v_line_total :=
        floor(v_quantity::numeric/v_promo_quantity::numeric)*v_promo_total
        + mod(v_quantity,v_promo_quantity)*v_unit_price;
    else
      v_line_total := v_quantity*v_unit_price;
    end if;

    v_line_total := round(v_line_total,2);
    v_total := v_total+v_line_total;

    v_items := v_items || jsonb_build_array(
      jsonb_build_object(
        'name',left(v_name,160),
        'quantity',v_quantity,
        'unitPrice',round(v_unit_price,2),
        'total',v_line_total
      )
    );
  end loop;

  insert into public.commerce_orders(
    project_id,
    template_key,
    items,
    total,
    customer_name,
    customer_phone
  )
  values(
    p_project_id,
    p_template_key,
    v_items,
    round(v_total,2),
    left(btrim(p_customer_name),120),
    left(regexp_replace(p_customer_phone,'\D','','g'),20)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_v2_commerce_order(uuid,text,jsonb,text,text) from public;
grant execute on function public.submit_v2_commerce_order(uuid,text,jsonb,text,text) to anon, authenticated;
