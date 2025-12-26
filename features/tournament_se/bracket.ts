export interface BracketParticipant {
  id: string;
  name: string;
  belt?: string | null;
  weight?: number | null;
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  playerA: BracketParticipant | null;
  playerB: BracketParticipant | null;
  winnerId?: string | null;
}

export interface BracketRound {
  round: number;
  matches: BracketMatch[];
}

export interface BracketFilter {
  belt?: string;
  weightRange?: { min: number; max: number };
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function applyFilters(participants: BracketParticipant[], filter?: BracketFilter) {
  if (!filter) return participants;
  return participants.filter((participant) => {
    const beltMatches = filter.belt ? participant.belt === filter.belt : true;
    const weightMatches = filter.weightRange
      ? (participant.weight ?? 0) >= filter.weightRange.min &&
        (participant.weight ?? 0) <= filter.weightRange.max
      : true;
    return beltMatches && weightMatches;
  });
}

export function generateSingleEliminationBracket(
  participants: BracketParticipant[],
  filter?: BracketFilter,
): BracketRound[] {
  const filtered = applyFilters(participants, filter);
  if (!filtered.length) return [];

  const shuffled = shuffle(filtered);
  const rounds: BracketRound[] = [];
  let roundNumber = 1;
  let currentPlayers = shuffled;

  while (currentPlayers.length > 1) {
    const matches: BracketMatch[] = [];
    for (let index = 0; index < currentPlayers.length; index += 2) {
      const playerA = currentPlayers[index] ?? null;
      const playerB = currentPlayers[index + 1] ?? null;
      matches.push({
        id: `${roundNumber}-${index / 2}`,
        round: roundNumber,
        position: index / 2,
        playerA,
        playerB,
      });
    }
    rounds.push({ round: roundNumber, matches });
    currentPlayers = matches.map((match) => match.playerA ?? match.playerB).filter(Boolean) as BracketParticipant[];
    roundNumber += 1;
  }

  return rounds;
}
