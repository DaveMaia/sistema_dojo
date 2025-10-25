import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface Params {
  params: { id: string };
}

export async function POST(_: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.academy_id || session.role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'PAID', paid_at: now, review_status: 'APPROVED', reviewed_by: session.user_id, reviewed_at: now })
    .eq('id', params.id)
    .eq('academy_id', session.academy_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await supabase
    .from('invoice_pix')
    .update({ status: 'PAID_MANUAL' })
    .eq('invoice_id', params.id)
    .eq('academy_id', session.academy_id);
  return NextResponse.json({ success: true });
}
