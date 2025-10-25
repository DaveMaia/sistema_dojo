export interface TournamentSummary {
  tournament: {
    id: string;
    name: string;
    start_at: string;
  } | null;
  nextMatch: {
    match_id: string;
    round_int: number;
    opponent_name: string;
    scheduled_at: string | null;
  } | null;
  bracket_url?: string | null;
}

export interface BracketNode {
  match_id: string;
  round: number;
  a?: string | null;
  b?: string | null;
  winner?: string | null;
  children?: BracketNode[];
}
