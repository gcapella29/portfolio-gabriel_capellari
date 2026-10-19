import type {TemplateRenderProps} from '../types';
import {CapellariConcept} from '@/app/portfolio-concept/concept-client';

/** Separate, reversible v2 template. portfolio-legacy-1 stays untouched. */
export function MultidisciplinaryPortfolioTemplate({data}:TemplateRenderProps){
  return <CapellariConcept data={data}/>;
}
