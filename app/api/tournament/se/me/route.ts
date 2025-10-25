import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await requireSession();
  const supabase = createSupabaseServerClient();
  const { data: participant } = await supabase
    .from('tournament_participants')
    .select('id, tournament_id, tournament:tournaments(name, start_at)')
    .eq('student_id', session.user_id)
    .eq('academy_id', session.academy_id)
    .maybeSingle();
  if (!participant) {
    return NextResponse.json({ tournament: null, nextMatch: null, bracket_url: null });
  }
  const { data: nextMatch } = await supabase
    .from('tournament_matches')
    .select('id, round_int, a_participant_id, b_participant_id, started_at')
    .eq('tournament_id', participant.tournament_id)
    .or(`a_participant_id.eq.${participant.id},b_participant_id.eq.${participant.id}`)
    .order('round_int')
    .maybeSingle();
  let opponentName = 'A definir';
  if (nextMatch) {
    const opponentId = nextMatch.a_participant_id === participant.id ? nextMatch.b_participant_id : nextMatch.a_participant_id;
    if (opponentId) {
      const { data: opponent } = await supabase
        .from('tournament_participants')
        .select('student:students(name)')
        .eq('id', opponentId)
        .maybeSingle();
      opponentName = opponent?.student?.name ?? opponentName;
    }
  }
  return NextResponse.json({
    tournament: participant.tournament,
    nextMatch: nextMatch
      ? {
          match_id: nextMatch.id,
          round_int: nextMatch.round_int,
          opponent_name: opponentName,
          scheduled_at: nextMatch.started_at,
        }
      : null,
    bracket_url: `/tournaments/${participant.tournament_id}`,
  });
}
