-- Copies the currently published Gabriel portfolio into the v2 draft/public
-- snapshots. Existing v2 keys win, so rerunning this migration is safe and
-- does not erase later edits. The legacy renderer remains active.
do $$
declare
  gabriel_project_id uuid;
  identity_seed jsonb;
  content_seed jsonb;
  media_seed jsonb;
  appearance_seed jsonb;
  contact_seed jsonb;
begin
  select id into gabriel_project_id
  from public.projects
  where slug = 'gabriel-capellari'
  limit 1;

  if gabriel_project_id is null then
    raise notice 'Project gabriel-capellari not found; migration skipped safely.';
    return;
  end if;

  identity_seed := jsonb_build_object(
    'name', 'Gabriel Capellari',
    'location', 'Ibitinga · SP · BR',
    'tagline', 'Jornalista de Poker · Professor · Redator · Curioso · Aprendiz .''.',
    'description', 'Formado em Letras (Português/Inglês) pela Universidade Estadual Paulista - UNESP, construí minha carreira misturando o estudo dos idiomas, a experiência em sala de aula e, posteriormente, o olhar jornalístico. Foram oito anos ensinando inglês e dois como professor de literatura brasileira antes de migrar para a cobertura de eventos ao vivo e redação de artigos jornalísticos especializados em poker.',
    'description_en', 'With a degree in Languages (Portuguese/English) from UNESP, I built my career by combining language study, classroom experience and, later, a journalistic perspective. I taught English for eight years and Brazilian literature for two before moving into live-event coverage and specialized poker journalism.',
    'languages', jsonb_build_array('Português — nativo', 'Inglês — B2', 'Espanhol — C2')
  );

  content_seed := jsonb_build_object(
    'hero_title', 'Da sala de aula aos grandes feltros do mundo',
    'hero_title_en', 'From the classroom to the world’s greatest felt tables',
    'hero_text', 'Jornalista de Poker · Professor · Redator · Curioso · Aprendiz .''.',
    'hero_text_en', 'Poker journalist · Live tournament reporter · SEO writer · Learner .·.',
    'about', 'No poker, trouxe comigo muito do que aprendi como professor: didática, clareza e atenção aos detalhes, habilidades desenvolvidas ao longo de anos trabalhando com centenas de alunos. Hoje, já são mais de quatro anos cobrindo eventos em países como Brasil, Estados Unidos, Panamá e Uruguai, produzindo conteúdo editorial e SEO para alguns dos principais veículos do setor.',
    'about_en', 'In poker, I brought much of what I learned as a teacher: clarity, attention to detail and an educational approach developed over years working with hundreds of students. I now have more than four years covering events in Brazil, the United States, Panama and Uruguay, producing editorial and SEO content for leading outlets in the industry.',
    'primary_offer', 'Formado em Letras (Português/Inglês), sempre fui apaixonado por esportes e comunicação. Através das palavras, encontrei uma forma de contar histórias, aproximar pessoas e transformar experiências em conexão.',
    'primary_offer_en', 'With a degree in Languages (Portuguese/English), I have always been passionate about sports and communication. Through words, I found a way to tell stories, bring people together and turn experiences into connection.',
    'proof', 'Quatro edições consecutivas da World Series of Poker em Las Vegas, de 2022 a 2025 — com cobertura também do WPT World Championship em 2022. Experiência internacional em reportagem ao vivo, produção editorial e conteúdo para a audiência brasileira de poker.',
    'proof_en', 'Four consecutive editions of the World Series of Poker in Las Vegas, from 2022 to 2025 — also covering the WPT World Championship in 2022. International experience in live reporting, editorial production and content for Brazilian poker audiences.'
  );

  media_seed := jsonb_build_object(
    'hero', jsonb_build_object('url', '/assets/media/hero-gabriel.jpg'),
    'about', jsonb_build_object('url', '/assets/media/about-gabriel.jpg'),
    'profile', jsonb_build_object('url', '/assets/media/portfolio-gabriel.jpg'),
    'contact', jsonb_build_object('url', '/assets/media/contact-gabriel.jpg'),
    'gallery', jsonb_build_array(
      jsonb_build_object('url', '/assets/media/wsop-01.jpg'),
      jsonb_build_object('url', '/assets/media/wsop-02.jpg'),
      jsonb_build_object('url', '/assets/media/wsop-03.png'),
      jsonb_build_object('url', '/assets/media/wsop-04.jpg'),
      jsonb_build_object('url', '/assets/media/wsop-05.jpg'),
      jsonb_build_object('url', '/assets/media/wsop-06.jpg'),
      jsonb_build_object('url', '/assets/media/wsop-07.jpg')
    ),
    'hero_fit', 'cover', 'hero_x', 22, 'hero_y', 81
  );

  appearance_seed := jsonb_build_object(
    'accent', '#e3bb3d', 'heading_font', 'Fraunces',
    'body_font', 'Inter', 'utility_font', 'IBM Plex Mono',
    'scale', 'normal', 'alignment', 'left', 'density', 'normal'
  );

  contact_seed := jsonb_build_object(
    'email', 'gcapellari@hotmail.com',
    'email_alt', 'gcapellari1@gmail.com',
    'whatsapp', '5516997168229',
    'whatsapp_label', '+55 16 99716-8229',
    'instagram', 'gabrielcapellari',
    'linkedin', 'https://www.linkedin.com/in/gabriel-capellari-5347ba14b/',
    'reel', 'https://www.instagram.com/p/DZK3eH_uRzP/embed',
    'cv', '/legacy-portfolio/CV-Gabriel-Capellari.pdf'
  );

  insert into public.project_v2_content(project_id,identity,content,media,appearance,contact)
  values(gabriel_project_id,identity_seed,content_seed,media_seed,appearance_seed,contact_seed)
  on conflict(project_id) do update set
    identity = identity_seed || coalesce(public.project_v2_content.identity,'{}'::jsonb),
    content = content_seed || coalesce(public.project_v2_content.content,'{}'::jsonb),
    media = media_seed || coalesce(public.project_v2_content.media,'{}'::jsonb),
    appearance = appearance_seed || coalesce(public.project_v2_content.appearance,'{}'::jsonb),
    contact = contact_seed || coalesce(public.project_v2_content.contact,'{}'::jsonb),
    updated_at = now();

  insert into public.project_v2_public_content(project_id,identity,content,media,appearance,contact,published_at)
  values(gabriel_project_id,identity_seed,content_seed,media_seed,appearance_seed,contact_seed,now())
  on conflict(project_id) do update set
    identity = identity_seed || coalesce(public.project_v2_public_content.identity,'{}'::jsonb),
    content = content_seed || coalesce(public.project_v2_public_content.content,'{}'::jsonb),
    media = media_seed || coalesce(public.project_v2_public_content.media,'{}'::jsonb),
    appearance = appearance_seed || coalesce(public.project_v2_public_content.appearance,'{}'::jsonb),
    contact = contact_seed || coalesce(public.project_v2_public_content.contact,'{}'::jsonb),
    published_at = coalesce(public.project_v2_public_content.published_at,now());
end $$;
