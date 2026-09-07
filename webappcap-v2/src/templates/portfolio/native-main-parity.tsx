import type { TemplateRenderProps } from '../types';
import { NativePortfolioTemplate } from './native';
import './legacy-motion.module.css';

/**
 * Native portfolio renderer with interaction parity to the approved main site.
 * The renderer/data remain native React/CMS; this wrapper intentionally imports
 * the motion skin whose source of truth is main/index.html.
 */
export function NativeMainParityPortfolioTemplate(props:TemplateRenderProps){
  return <NativePortfolioTemplate {...props}/>;
}
