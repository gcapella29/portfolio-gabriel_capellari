'use client';

import {useState} from 'react';
import EditorPreviewDialog from '../../dashboard/[slug]/editor-preview-dialog';

export default function RootPreviewControl({className,label='Preview'}:{className?:string;label?:string}){
 const [open,setOpen]=useState(false);
 return <>
  <button type="button" className={className} onClick={()=>setOpen(true)}>{label}</button>
  <EditorPreviewDialog open={open} previewUrl="/owner/root/preview" onClose={()=>setOpen(false)}/>
 </>;
}
