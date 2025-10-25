import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface Params {
  params: { invoiceId: string };
}

export async function POST(request: Request, { params }: Params) {
  const session = await requireSession();
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const proofUrl = `data:${file.type};base64,${base64}`;

  const supabase = createSupabaseServerClient();
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, academy_id, student_id')
    .eq('id', params.invoiceId)
    .maybeSingle();
  if (error || !invoice) {
    return NextResponse.json({ error: error?.message || 'Fatura não encontrada' }, { status: 404 });
  }
  if (invoice.academy_id !== session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  if (session.role === 'ATHLETE' && invoice.student_id !== session.user_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { error: pixError } = await supabase
    .from('invoice_pix')
    .update({ proof_url: proofUrl, status: 'AWAITING' })
    .eq('invoice_id', invoice.id);
  if (pixError) {
    return NextResponse.json({ error: pixError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ review_status: 'PROOF_UPLOADED' })
    .eq('id', invoice.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
