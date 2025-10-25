import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface Params {
  params: { id: string };
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('class_reservations')
    .delete()
    .eq('class_id', params.id)
    .eq('user_id', session.user_id)
    .eq('academy_id', session.academy_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
