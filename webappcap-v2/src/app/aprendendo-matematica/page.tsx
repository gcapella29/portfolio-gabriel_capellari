import type {Metadata} from 'next';

const APP_URL='https://script.google.com/macros/s/AKfycbxquiATK-Je3l8ej7L9wnzjV8Q8MXQwt29BeuufiZnlJyV23gC6qBX0RcYCb06jeiTj/exec';

export const metadata:Metadata={
 title:'Aprendendo Matemática | WebAppCap',
 description:'Sua jornada de aprendizagem matemática, dos fundamentos ao avançado.',
 robots:{index:false,follow:false}
};

export default function AprendendoMatematicaPage(){
 return <main style={{margin:0,minHeight:'100dvh',background:'#f7f8fc',color:'#1c2542',fontFamily:'system-ui,-apple-system,sans-serif'}}>
  <header style={{height:54,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 18px',background:'#fff',borderBottom:'1px solid #e5e7f0',gap:12}}>
   <strong style={{fontSize:16,whiteSpace:'nowrap'}}>∑ Aprendendo Matemática</strong>
   <a href={APP_URL} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#6956da',fontWeight:700}}>Abrir em nova guia ↗</a>
  </header>
  <iframe src={APP_URL} title="Aplicativo Aprendendo Matemática" style={{display:'block',width:'100%',height:'calc(100dvh - 54px)',border:0,background:'#f7f8fc'}} referrerPolicy="no-referrer"/>
  <noscript><p style={{padding:24}}>Ative o JavaScript para usar o aplicativo ou <a href={APP_URL}>abra o Apps Script diretamente</a>.</p></noscript>
 </main>;
}
