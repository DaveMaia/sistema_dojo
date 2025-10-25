import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildPixPayload, payloadToSvg } from '@/features/payments_pix/brcode';
import { generateTxId } from '@/lib/utils/id';

interface Params {
  params: { invoiceId: string };
}

export async function GET(_: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json({ error: 'Associe-se a uma academia' }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, academy_id, student_id')
    .eq('id', params.invoiceId)
    .maybeSingle();
  if (invoiceError || !invoice || invoice.academy_id !== session.academy_id) {
    return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 });
  }
  if (session.role === 'ATHLETE' && invoice.student_id !== session.user_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const { data, error } = await supabase
    .from('invoice_pix')
    .select('txid, brcode_payload, qr_svg')
    .eq('invoice_id', params.invoiceId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Nenhum PIX gerado ainda' }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function POST(_: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json({ error: 'Associe-se a uma academia' }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id, academy_id, amount_numeric, status, student_id')
    .eq('id', params.invoiceId)
    .maybeSingle();
  if (invoiceError || !invoice) {
    return NextResponse.json({ error: invoiceError?.message || 'Fatura não encontrada' }, { status: 404 });
  }
  if (invoice.academy_id !== session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  if (session.role === 'ATHLETE' && invoice.student_id !== session.user_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { data: settings, error: settingsError } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('academy_id', session.academy_id)
    .maybeSingle();
  if (settingsError || !settings) {
    return NextResponse.json(
      { error: settingsError?.message || 'Configuração de PIX não encontrada' },
      { status: 400 },
    );
  }
  if (!settings.pix_key) {
    return NextResponse.json({ error: 'PIX não configurado' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('invoice_pix')
    .select('*')
    .eq('invoice_id', invoice.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      txid: existing.txid,
      brcode_payload: existing.brcode_payload,
      qr_svg: existing.qr_svg,
    });
  }

  const txid = generateTxId(invoice.id);
  const payload = buildPixPayload({
    pixKey: settings.pix_key,
    merchantName: settings.pix_receiver_name ?? 'Academia',
    merchantCity: settings.pix_city ?? 'Belem',
    amount: invoice.amount_numeric,
    txid,
    description: settings.description_prefix ?? undefined,
  });
  const svg = await payloadToSvg(payload);

  const { error: insertError } = await supabase.from('invoice_pix').insert({
    academy_id: session.academy_id,
    invoice_id: invoice.id,
    txid,
    brcode_payload: payload,
    qr_svg: svg,
    status: 'AWAITING',
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ txid, brcode_payload: payload, qr_svg: svg });
}
