import { ReactNode } from 'react';
import { StudentNav } from './ui/student-nav';

export default function AlunoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <StudentNav />
      <main className="flex-1 px-4 pb-24 pt-6 md:px-10 md:pb-10 md:pt-10">
        {children}
      </main>
    </div>
  );
}
