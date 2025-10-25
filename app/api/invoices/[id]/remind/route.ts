import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface Params {
  params: { id: string };
}

export async function POST(_: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.academy_id || session.role === 'ATHLETE') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, academy_id, student:students(phone, name)')
    .eq('id', params.id)
    .maybeSingle();
  if (error || !invoice) {
    return NextResponse.json({ error: error?.message || 'Fatura não encontrada' }, { status: 404 });
  }
  if (invoice.academy_id !== session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  if (!invoice.student?.phone) {
    return NextResponse.json({ error: 'Aluno sem telefone cadastrado' }, { status: 400 });
  }
  const scheduledAt = new Date().toISOString();
  const { error: insertError } = await supabase.from('message_outbox').insert({
    academy_id: session.academy_id,
    to_phone: invoice.student.phone,
    event_type: 'INVOICE_DUE_0D',
    payload_json: { invoice_id: invoice.id, student_name: invoice.student.name },
    scheduled_at: scheduledAt,
    status: 'SCHEDULED',
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
