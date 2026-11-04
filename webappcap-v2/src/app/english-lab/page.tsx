import type {Metadata} from 'next';

const appUrl='https://script.google.com/macros/s/AKfycbxI1i62oEoK2uy20q8uZnTHYxZwxD1-yokvxx_1ZWcZ6Xfu4APdygAH1mRCo2IOXQeg/exec';

export const metadata:Metadata={
  title:'English Lab | WebAppCap',
  description:'Laboratório pessoal de inglês — WebAppCap.',
  robots:{index:false,follow:false}
};

export default function EnglishLabPage(){
  return (
    <main style={{height:'100dvh',minHeight:500,display:'flex',flexDirection:'column',background:'#f3f6fb',fontFamily:'system-ui,-apple-system,Segoe UI,sans-serif'}}>
      <header style={{minHeight:62,background:'#142640',color:'#fff',padding:'12px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:14,flexWrap:'wrap'}}>
        <strong style={{fontSize:18,letterSpacing:'-.025em'}}>WebAppCap <span style={{color:'#71ddba'}}>/ English Lab</span></strong>
        <a href={appUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:13,fontWeight:700,background:'#269e7b',color:'#fff',padding:'10px 13px',borderRadius:9,textDecoration:'none'}}>Abrir app ↗</a>
      </header>
      <iframe
        title="English Lab — atividades"
        src={appUrl}
        allow="microphone"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{display:'block',border:0,width:'100%',flex:1,minHeight:400,background:'#fff'}}
      />
      <div style={{background:'#e7eef5',color:'#435b72',fontSize:12,padding:'8px 18px'}}>
        Se o Google bloquear a incorporação ou solicitar login, use o botão “Abrir app” acima.
      </div>
    </main>
  );
}
