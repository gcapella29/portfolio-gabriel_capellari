import type { Metadata } from 'next';
import './globals.css';
import './backend-interactions.css';

export const metadata: Metadata = {
  title: 'WebAppCap',
  description: 'Sites profissionais com identidade própria e gestão simples.'
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
