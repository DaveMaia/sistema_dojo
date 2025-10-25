import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json({
      student: null,
      academy: null,
      rank: { belt: 'Branca', degree_int: 0, requiredSkills: [], history: [] },
    });
  }
  const supabase = createSupabaseServerClient();
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('academy_id', session.academy_id)
    .eq('id', session.user_id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!student) {
    return NextResponse.json({
      student: null,
      academy: null,
      rank: { belt: 'Branca', degree_int: 0, requiredSkills: [], history: [] },
    });
  }
  const { data: academy } = await supabase
    .from('academies')
    .select('id, name')
    .eq('id', student.academy_id)
    .maybeSingle();
  const { data: skills } = await supabase
    .from('student_skills')
    .select('name, required, completed, updated_at')
    .eq('student_id', student.id)
    .eq('academy_id', session.academy_id);
  const { data: history } = await supabase
    .from('student_rankings')
    .select('*')
    .eq('student_id', student.id)
    .eq('academy_id', session.academy_id)
    .order('changed_at', { ascending: false });

  return NextResponse.json({
    student,
    academy,
    rank: {
      belt: history?.[0]?.belt ?? student.belt ?? 'Branca',
      degree_int: history?.[0]?.degree_int ?? 0,
      nextBelt: 'Azul',
      requiredSkills: skills?.filter((skill) => skill.required).map((skill) => ({ name: skill.name, completed: skill.completed })) ?? [],
      history: history?.map((item) => ({ belt: item.belt, degree_int: item.degree_int, changed_at: item.changed_at })) ?? [],
    },
  });
}
