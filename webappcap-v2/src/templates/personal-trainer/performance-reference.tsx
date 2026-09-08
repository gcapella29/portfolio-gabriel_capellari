import type { TemplateRenderProps } from '../types';
import { PerformanceTrainerTemplate } from './performance';
import styles from './performance-reference.module.css';

/**
 * High-fidelity presentation layer for Performance.
 * Keeps semantic CMS/content handling in performance.tsx while letting the
 * visual system evolve independently from the content contract.
 */
export function PerformanceReferenceTemplate(props:TemplateRenderProps){
  return <div className={styles.scope}><PerformanceTrainerTemplate {...props}/></div>;
}
