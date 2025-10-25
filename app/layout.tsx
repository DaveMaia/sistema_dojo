import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { QueryProvider } from '@/components/query-provider';
import { Toaster } from '@/components/toaster';
import { PwaRegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'Sistema Dojo',
  description: 'MVP SaaS Academia de Jiu-Jitsu com Supabase e PIX',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/icons/icon-192.png' },
    { rel: 'apple-touch-icon', url: '/icons/icon-512.png' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white">
        <QueryProvider>
          <PwaRegister />
          <div className="min-h-screen flex flex-col">
            <header className="p-4 border-b border-slate-800 bg-slate-900">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <span className="text-lg font-semibold">Sistema Dojo</span>
                <span className="text-xs text-slate-300">Supabase • PIX • Torneios</span>
              </div>
            </header>
            <main className="flex-1 max-w-5xl w-full mx-auto p-4">{children}</main>
            <footer className="p-4 text-center text-xs text-slate-400 bg-slate-900">
              Feito para academias de Jiu-Jitsu no Brasil. Mobile-first.
            </footer>
          </div>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
