import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebAppCap v2',
  description: 'Nova base do WebAppCap'
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
