import { BadgeSelector } from '../ui/badge-selector';
import { RecadosSection } from '../ui/portal-sections';

const badges = [
  { id: 'b1', nome: 'Campeão Interno', descricao: 'Vitória no campeonato interno.', unlocked: true },
  { id: 'b2', nome: '100% Presença', descricao: 'Presença perfeita no mês.', unlocked: true },
  { id: 'b3', nome: 'Finalizador', descricao: '5 finalizações em sequência.', unlocked: true },
  { id: 'b4', nome: 'Estratégia Sombria', descricao: 'Vencer por vantagem.', unlocked: false },
  { id: 'b5', nome: 'Mestre da Guarda', descricao: 'Dominar 3 variações de guarda.', unlocked: false },
];

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Identidade</p>
        <h1 className="mt-2 text-2xl font-semibold">Perfil Público</h1>
        <p className="mt-2 text-sm text-slate-400">
          Mostre seus destaques de honra e fortaleça seu prestígio no dojô.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-20 w-20 rounded-2xl bg-slate-800" />
          <div>
            <h2 className="text-xl font-semibold">Lia Montenegro</h2>
            <p className="text-sm text-slate-400">Equipe Ragnarok • Faixa Roxa</p>
          </div>
        </div>
      </section>

      <BadgeSelector badges={badges} initialHighlighted={['b1', 'b2', 'b3']} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Feedback privado</h2>
        <RecadosSection />
      </section>
    </div>
  );
}
