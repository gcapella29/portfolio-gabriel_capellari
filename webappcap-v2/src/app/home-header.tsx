'use client';

import { useEffect, useState } from 'react';
import styles from './home.module.css';

const links=[
  {href:'#como-funciona',label:'Como funciona'},
  {href:'#painel',label:'Painel'},
  {href:'#projetos',label:'Projetos'},
  {href:'#servicos',label:'Serviços'},
  {href:'#duvidas',label:'Dúvidas'},
  {href:'#contato',label:'Contato'}
];

export function HomeHeader(){
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);

  useEffect(()=>{
    function update(){setScrolled(window.scrollY>28)}
    function closeOnEscape(event:KeyboardEvent){if(event.key==='Escape')setOpen(false)}
    update();
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('keydown',closeOnEscape);
    return ()=>{
      window.removeEventListener('scroll',update);
      window.removeEventListener('keydown',closeOnEscape);
    };
  },[]);

  return <header className={`${styles.nav} ${scrolled?styles.navScrolled:''} ${open?styles.navOpen:''}`}>
    <a className={styles.brand} href="#inicio" aria-label="WebAppCap — início" onClick={()=>setOpen(false)}><span>W</span>WebAppCap</a>
    <button className={styles.menuButton} type="button" aria-expanded={open} aria-controls="home-navigation" aria-label={open?'Fechar menu':'Abrir menu'} onClick={()=>setOpen(value=>!value)}>
      <span/><span/>
    </button>
    <nav id="home-navigation" aria-label="Navegação principal">
      {links.map(link=><a key={link.href} href={link.href} onClick={()=>setOpen(false)}>{link.label}</a>)}
    </nav>
    <a className={styles.login} href="/login">Área do cliente <span>↗</span></a>
    <span className={styles.navProgress} aria-hidden="true"/>
  </header>;
}
