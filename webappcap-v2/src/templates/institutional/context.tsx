'use client';
import {createContext, useContext} from 'react';
import type {institutionalData} from '@/core/institutional-content';
export type InstitutionalModel = ReturnType<typeof institutionalData> & {
  name: string;
  contact: Record<string, unknown>;
  wa: (message?: string) => string | undefined;
};
export const InstitutionalContext = createContext<{
  model: InstitutionalModel;
  album: string;
  setAlbum: (id: string) => void;
  photo: {src: string; caption: string} | null;
  setPhoto: (value: {src: string; caption: string} | null) => void;
  notify: (message: string) => void;
} | null>(null);
export function useInstitutional() {
  const context = useContext(InstitutionalContext);
  if (!context) throw new Error('Institutional context missing');
  return context;
}
export function placeholder(title: string, index: number) {
  const esc = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (char) =>
        ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[
          char
        ]!,
    );
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${['#1f3a64', '#b8863b', '#0f1d33', '#4a6a99'][index % 4]}"/><stop offset="1" stop-color="${['#0f1d33', '#d4a24c', '#1f3a64', '#b8863b'][index % 4]}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><text x="200" y="160" text-anchor="middle" font-family="Georgia" font-size="22" fill="rgba(255,255,255,.85)">${esc(title)}</text></svg>`,
    )
  );
}
