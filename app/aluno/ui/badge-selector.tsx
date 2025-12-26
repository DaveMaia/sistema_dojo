'use client';

import { useMemo, useState } from 'react';

interface Badge {
  id: string;
  nome: string;
  descricao: string;
  unlocked: boolean;
}

interface BadgeSelectorProps {
  badges: Badge[];
  initialHighlighted: string[];
}

export function BadgeSelector({ badges, initialHighlighted }: BadgeSelectorProps) {
  const [highlighted, setHighlighted] = useState<string[]>(initialHighlighted);
  const [open, setOpen] = useState(false);

  const highlightedBadges = useMemo(
    () => badges.filter((badge) => highlighted.includes(badge.id)).slice(0, 3),
    [badges, highlighted],
  );

  function toggleBadge(id: string) {
    setHighlighted((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Destaques de Honra</h3>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
          >
            Selecionar badges
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {highlightedBadges.length ? (
            highlightedBadges.map((badge) => (
              <div key={badge.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">{badge.nome}</p>
                <p className="mt-2 text-[11px] text-slate-500">{badge.descricao}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Escolha até 3 badges para destacar.</p>
          )}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 md:items-center">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Seleção de Badges</p>
                <h4 className="text-lg font-semibold">Escolha até 3 destaques</h4>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
              >
                Fechar
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {badges.map((badge) => {
                const isSelected = highlighted.includes(badge.id);
                return (
                  <button
                    key={badge.id}
                    type="button"
                    disabled={!badge.unlocked}
                    onClick={() => toggleBadge(badge.id)}
                    className={`rounded-xl border px-4 py-3 text-left text-xs transition ${
                      badge.unlocked
                        ? isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300'
                        : 'border-slate-900 bg-slate-900/30 text-slate-600'
                    }`}
                  >
                    <p className="text-sm font-semibold">{badge.nome}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{badge.descricao}</p>
                    {!badge.unlocked ? (
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-600">Bloqueado</p>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Selecionados: {highlighted.length}/3
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
