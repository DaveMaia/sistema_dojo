interface Badge {
  id: string;
  nome: string;
  descricao?: string | null;
  destaque?: boolean;
  tipo?: 'auto' | 'manual';
}

interface BadgeHighlightProps {
  badges: Badge[];
}

const iconMap = {
  auto: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M12 3l7 3v6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6l7-3z"
        fill="currentColor"
      />
    </svg>
  ),
  manual: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 3z"
        fill="currentColor"
      />
    </svg>
  ),
  destaque: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path d="M12 2l3 7h7l-5.6 4.4L18 22l-6-4-6 4 1.6-8.6L2 9h7l3-7z" fill="currentColor" />
    </svg>
  ),
};

export function BadgeHighlight({ badges }: BadgeHighlightProps) {
  const highlighted = badges.filter((badge) => badge.destaque).slice(0, 3);
  const remaining = badges.filter((badge) => !badge.destaque);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <header className="space-y-1">
        <h3 className="text-base font-semibold">Destaques do aluno</h3>
        <p className="text-xs text-slate-400">Somente 3 badges podem ficar em evidência.</p>
      </header>
      <div className="grid gap-3 md:grid-cols-3">
        {highlighted.length ? (
          highlighted.map((badge) => {
            return (
              <article key={badge.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center gap-2 text-primary">
                  {iconMap.destaque}
                  {badge.tipo === 'auto' ? iconMap.auto : iconMap.manual}
                  <span className="text-sm font-semibold">{badge.nome}</span>
                </div>
                {badge.descricao ? (
                  <p className="mt-2 text-xs text-slate-400">{badge.descricao}</p>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className="text-xs text-slate-400">Nenhum badge em destaque ainda.</p>
        )}
      </div>
      {remaining.length ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Outras conquistas</p>
          <div className="flex flex-wrap gap-2">
            {remaining.map((badge) => {
              return (
                <span key={badge.id} className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300">
                  <span className="h-3 w-3 text-primary">{badge.tipo === 'auto' ? iconMap.auto : iconMap.manual}</span>
                  {badge.nome}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
