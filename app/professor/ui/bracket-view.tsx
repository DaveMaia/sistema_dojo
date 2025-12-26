'use client';

import { useMemo, useState } from 'react';
import type { BracketParticipant } from '@/features/tournament_se/bracket';
import { generateSingleEliminationBracket } from '@/features/tournament_se/bracket';

interface BracketViewProps {
  participants: BracketParticipant[];
}

export function BracketView({ participants }: BracketViewProps) {
  const baseRounds = useMemo(() => generateSingleEliminationBracket(participants), [participants]);
  const [winners, setWinners] = useState<Record<string, string>>({});

  const rounds = useMemo(() => {
    if (!baseRounds.length) return [];
    const updatedRounds = baseRounds.map((round) => ({
      ...round,
      matches: round.matches.map((match) => ({
        ...match,
        winnerId: winners[match.id] ?? null,
      })),
    }));

    for (let roundIndex = 0; roundIndex < updatedRounds.length - 1; roundIndex += 1) {
      const nextRound = updatedRounds[roundIndex + 1];
      const winnersForRound = updatedRounds[roundIndex].matches.map((match) => {
        if (match.winnerId === match.playerA?.id) return match.playerA;
        if (match.winnerId === match.playerB?.id) return match.playerB;
        return match.playerA ?? match.playerB ?? null;
      });

      nextRound.matches = nextRound.matches.map((match, index) => {
        const playerA = winnersForRound[index * 2] ?? null;
        const playerB = winnersForRound[index * 2 + 1] ?? null;
        return { ...match, playerA, playerB };
      });
    }

    return updatedRounds;
  }, [baseRounds, winners]);

  if (!rounds.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-400">
        Nenhum inscrito encontrado para gerar a chave.
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <h3 className="text-base font-semibold">Chave do Torneio (Single Elimination)</h3>
      <div className="flex flex-col gap-6 overflow-x-auto lg:flex-row">
        {rounds.map((round) => (
          <div key={round.round} className="min-w-[220px] space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Rodada {round.round}</p>
            {round.matches.map((match) => (
              <div key={match.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                {[match.playerA, match.playerB].map((player) => (
                  <button
                    key={player?.id ?? `${match.id}-empty`}
                    type="button"
                    disabled={!player}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                      match.winnerId === player?.id
                        ? 'bg-primary/20 text-primary'
                        : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800/60'
                    }`}
                    onClick={() => {
                      if (!player) return;
                      setWinners((prev) => ({ ...prev, [match.id]: player.id }));
                    }}
                  >
                    <span>{player?.name ?? 'A definir'}</span>
                    <span className="text-[10px] text-slate-500">
                      {player?.belt ?? '—'}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
