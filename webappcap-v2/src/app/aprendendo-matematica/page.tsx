import type {Metadata} from 'next';
import {requirePlatformOwner} from '@/core/session';
import MathClient from './math-client';

export const dynamic='force-dynamic';
export const metadata:Metadata={
 title:'Aprendendo Matemática | WebAppCap',
 description:'Aprenda matemática do básico ao avançado com diagnóstico progressivo.',
 robots:{index:false,follow:false}
};

export default async function AprendendoMatematicaPage(){
 await requirePlatformOwner();
 return <MathClient/>;
}
