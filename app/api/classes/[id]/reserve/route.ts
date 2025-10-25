import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface Params {
  params: { id: string };
}

export async function POST(_: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('class_reservations').insert({
    academy_id: session.academy_id,
    class_id: params.id,
    user_id: session.user_id,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
