import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const createSchema = z.object({
  student_id: z.string().uuid(),
  title: z.string().min(3),
  message: z.string().min(3),
});

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json([]);
  }
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target');
  const supabase = createSupabaseServerClient();
  let query = supabase.from('notes').select('*').eq('academy_id', session.academy_id).order('created_at', { ascending: false });
  if (target === 'me') {
    query = query.eq('student_id', session.user_id);
  } else if (searchParams.get('studentId')) {
    query = query.eq('student_id', searchParams.get('studentId'));
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (target === 'me' && data.length > 0) {
    await supabase
      .from('notes')
      .update({ read_at: new Date().toISOString() })
      .eq('student_id', session.user_id)
      .is('read_at', null);
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session.academy_id || session.role === 'ATHLETE') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const body = await request.json();
  const payload = createSchema.parse(body);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('notes').insert({
    academy_id: session.academy_id,
    student_id: payload.student_id,
    title: payload.title,
    message: payload.message,
    admin_user_id: session.user_id,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
