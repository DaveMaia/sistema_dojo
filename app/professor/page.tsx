import Link from 'next/link';
import { BadgeHighlight } from './ui/badge-highlight';
import { RadarChart } from './ui/radar-chart';
import { BracketView } from './ui/bracket-view';

const mockStats = [
  { label: 'Resistência', value: 82 },
  { label: 'Guarda', value: 74 },
  { label: 'Passagem', value: 68 },
  { label: 'Finalização', value: 63 },
  { label: 'Psicológico', value: 88 },
];

const badges = [
  {
    id: 'badge-1',
    nome: 'Inabalável',
    descricao: 'Presença acima de 90% no mês.',
    destaque: true,
    tipo: 'auto' as const,
  },
  {
    id: 'badge-2',
    nome: 'Espírito de Guerreiro',
    descricao: 'Reconhecimento do mestre pela atitude em treino.',
    destaque: true,
    tipo: 'manual' as const,
  },
  {
    id: 'badge-3',
    nome: 'Disciplina de Ferro',
    descricao: '30 dias sem faltar aos treinos.',
    destaque: true,
    tipo: 'auto' as const,
  },
  {
    id: 'badge-4',
    nome: 'Estratégia Sombria',
    descricao: 'Vitória por finalização relâmpago.',
    destaque: false,
    tipo: 'manual' as const,
  },
];

const roadmap = [
  { label: '50 aulas assistidas', complete: true },
  { label: 'Dominar raspagem de gancho', complete: false },
  { label: 'Sequência de guarda fechada', complete: true },
  { label: '3 vitórias em campeonato local', complete: false },
];

const participants = [
  { id: 'p1', name: 'Arthur Lima', belt: 'Azul', weight: 74 },
  { id: 'p2', name: 'Rafa Souza', belt: 'Azul', weight: 78 },
  { id: 'p3', name: 'Camila Torres', belt: 'Roxa', weight: 62 },
  { id: 'p4', name: 'Iuri Martins', belt: 'Roxa', weight: 85 },
  { id: 'p5', name: 'Nina Duarte', belt: 'Marrom', weight: 70 },
  { id: 'p6', name: 'Felipe Costa', belt: 'Marrom', weight: 92 },
];

export default function ProfessorModulePage() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-900/50 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mestre da Jornada</p>
          <h1 className="text-3xl font-semibold">Painel do Professor</h1>
          <p className="text-sm text-slate-400">
            Controle o progresso técnico dos alunos como em um RPG: atributos, conquistas e
            desafios em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/professor/attendance-scan"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Abrir Scanner de Presença
          </Link>
          <span className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-400">
            Tema Gótico / Dark Mode ativo
          </span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ficha do Personagem</h2>
          <RadarChart stats={mockStats} />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Roadmap de Faixa</h2>
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            {roadmap.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.complete ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  <span className={item.complete ? 'text-slate-200' : 'text-slate-400'}>
                    {item.label}
                  </span>
                </div>
                <span
                  className={`text-xs ${item.complete ? 'text-emerald-300' : 'text-slate-500'}`}
                >
                  {item.complete ? 'Concluído' : 'Pendente'}
                </span>
              </div>
            ))}
            <div className="mt-4 h-2 w-full rounded-full bg-slate-900">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <p className="text-xs text-slate-400">Progresso geral da faixa: 66%</p>
          </div>
        </div>
      </section>

      <BadgeHighlight badges={badges} />

      <BracketView participants={participants} />
    </div>
  );
}
