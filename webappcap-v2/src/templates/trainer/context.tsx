'use client';
import type {CSSProperties} from 'react';
import {createContext,useContext} from 'react';
import {trainerData,trainerStates} from '@/core/trainer-content';
export type StateCopy=typeof trainerStates.aberta;
export type TrainerModel=ReturnType<typeof trainerData>&{name:string;cref:string;portrait:string;portraitStyle:CSSProperties;wa:(message:string)=>string|undefined};
export const TrainerContext=createContext<TrainerModel|null>(null);
export function useTrainer(){const model=useContext(TrainerContext);if(!model)throw new Error('Personal Trainer context missing');return model}
export const ph=(text:string,color:string)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="${color}"/><circle cx="200" cy="170" r="62" fill="rgba(255,255,255,.35)"/><path d="M70 470c0-100 55-170 130-170s130 70 130 170z" fill="rgba(255,255,255,.35)"/><text x="200" y="60" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#fff">${text}</text></svg>`);
