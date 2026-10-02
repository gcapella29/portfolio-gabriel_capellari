import type {ReactNode} from 'react';
import styles from './editor-blocks.module.css';

export default function EditorBlock({id,number,title,summary,children,open=false}:{id:string;number:string;title:string;summary:string;children:ReactNode;open?:boolean}){
 return <details className={styles.block} id={id} open={open}><summary><b>{number}</b><span><strong>{title}</strong><small>{summary}</small></span></summary><div className={styles.blockBody}>{children}</div></details>;
}
