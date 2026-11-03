import styles from './math.module.css';
const states:Record<string,{intro:string;strips:{label:string;parts:number;active:number;color?:'blue'|'violet'}[];explanation:string}>={
 A10:{intro:'Uma barra representa o todo. Três das oito partes iguais estão selecionadas.',strips:[{label:'3/8',parts:8,active:3}],explanation:'Numerador: 3 partes escolhidas. Denominador: 8 partes iguais no todo.'},
 A11:{intro:'As duas barras representam exatamente a mesma quantidade.',strips:[{label:'1/2',parts:2,active:1},{label:'2/4',parts:4,active:2,color:'blue'}],explanation:'Subdividir uma metade em duas partes gera dois quartos, sem alterar a quantidade.'},
 A12:{intro:'Compare frações do mesmo todo usando a mesma unidade.',strips:[{label:'1/2 = 3/6',parts:6,active:3},{label:'2/3 = 4/6',parts:6,active:4,color:'blue'}],explanation:'Quatro sextos ocupam mais espaço que três sextos: 2/3 > 1/2.'},
 A13:{intro:'Os oitavos têm o mesmo tamanho nas três barras.',strips:[{label:'2/8',parts:8,active:2},{label:'+ 3/8',parts:8,active:3,color:'blue'},{label:'= 5/8',parts:8,active:5}],explanation:'Somamos quantos oitavos foram escolhidos: 2 + 3 = 5; o denominador permanece 8.'},
 A14:{intro:'Antes de somar, escreva a metade como dois quartos.',strips:[{label:'1/2 = 2/4',parts:4,active:2},{label:'+ 1/4',parts:4,active:1,color:'blue'},{label:'= 3/4',parts:4,active:3}],explanation:'A unidade agora é a mesma: 2 quartos + 1 quarto = 3 quartos.'},
 A15:{intro:'Partimos de seis oitavos e retiramos dois oitavos.',strips:[{label:'6/8',parts:8,active:6},{label:'− 2/8',parts:8,active:2,color:'blue'},{label:'= 4/8',parts:8,active:4}],explanation:'Restam quatro oitavos, que equivalem a metade da barra.'},
 A16:{intro:'Transforme a metade em quartos antes de retirar.',strips:[{label:'3/4',parts:4,active:3},{label:'− 1/2 = 2/4',parts:4,active:2,color:'blue'},{label:'= 1/4',parts:4,active:1}],explanation:'De três quartos, retiramos dois: sobra um quarto.'},
 A17:{intro:'Metade de três quartos é uma fração de outra fração.',strips:[{label:'3/4',parts:4,active:3},{label:'metade de 3/4',parts:8,active:3,color:'blue'}],explanation:'Cada quarto é dividido ao meio. Três dessas oito partes representam 3/8.'},
 A18:{intro:'Quantos quartos cabem em três quartos?',strips:[{label:'3/4',parts:4,active:3},{label:'um copo = 1/4',parts:4,active:1,color:'blue'}],explanation:'Cabem três porções de 1/4 em 3/4. A divisão 3/4 ÷ 1/4 resulta em 3.'}
};
export default function FractionConcept({lessonId}:{lessonId:string}){
 const item=states[lessonId];
 if(!item)return null;
 return <div className={styles.fractionConcept}><span className={styles.chapterMarker}>MODELO VISUAL · OBSERVE AS PARTES IGUAIS</span><p>{item.intro}</p><div className={styles.fractionConceptStrips}>{item.strips.map((strip,i)=><div key={i} className={styles.fractionConceptRow}><strong>{strip.label}</strong><div className={styles.fractionConceptBar} style={{gridTemplateColumns:`repeat(${strip.parts},minmax(0,1fr))`}}>{Array.from({length:strip.parts},(_,n)=><span key={n} className={n<strip.active?(strip.color==='blue'?styles.fractionConceptBlue:styles.fractionConceptViolet):''}/>)}</div></div>)}</div><small>{item.explanation}</small></div>;
}