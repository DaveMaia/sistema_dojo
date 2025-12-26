'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/aluno/home', label: 'Meu Dojo' },
  { href: '/aluno/evolucao', label: 'Evolução' },
  { href: '/aluno/pagamentos', label: 'Arsenal' },
  { href: '/aluno/perfil', label: 'Identidade' },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur md:static md:h-full md:w-56 md:border-r md:border-t-0">
      <div className="flex items-center justify-between px-6 py-5 md:flex-col md:items-start md:gap-6">
        <div className="hidden text-xs uppercase tracking-[0.3em] text-slate-500 md:block">
          Experiência do Aluno
        </div>
        <div className="flex w-full items-center justify-around md:flex-col md:items-start md:gap-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition md:w-full md:text-sm ${
                  isActive
                    ? 'bg-primary text-slate-950'
                    : 'text-slate-300 hover:bg-slate-900/70'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
