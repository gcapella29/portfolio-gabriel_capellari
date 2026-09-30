import styles from './editor-workspace-header.module.css';

export type WorkspaceFact={label:string;value:string};

export default function EditorWorkspaceHeader({
 eyebrow,
 title,
 description,
 facts=[],
 variant='default',
 className=''
}:{
 eyebrow:string;
 title:string;
 description:string;
 facts?:WorkspaceFact[];
 variant?:'default'|'bakery'|'plain';
 className?:string;
}){
 return <section className={`${styles.header} ${styles[variant]} ${className}`}>
  <div className={styles.copy}>
   <span>{eyebrow}</span>
   <h1>{title}</h1>
   <p>{description}</p>
  </div>
  {facts.length?<div className={styles.facts}>{facts.map(fact=><span key={fact.label}><small>{fact.label}</small><strong>{fact.value}</strong></span>)}</div>:null}
 </section>;
}
