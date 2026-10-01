import type {TemplateRenderProps} from '../types';
import {CommerceCompleteTemplate} from './commerce-complete';
import {CommerceSalesTemplate} from './commerce-sales';
import {CommerceModernTemplate} from './commerce-modern';

const text=(record:Record<string,unknown>,key:string,fallback='')=>
  String(record[key]??'').trim()||fallback;

export function CommerceTemplate(props:TemplateRenderProps){
  const key=text(
    props.data.appearance,
    'preview_template_key',
    props.project.templateKey||'commerce-main-1'
  );
  if(key==='commerce-modern-1')return <CommerceModernTemplate {...props}/>;
  return key.includes('sales')
    ? <CommerceSalesTemplate {...props}/>
    : <CommerceCompleteTemplate {...props}/>;
}
