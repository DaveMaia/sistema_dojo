import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { resolvePixProvider } from '@/features/payments_pix/provider';

interface Params {
  params: { invoiceId: string };
}

export async function POST(request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.academy_id || session.role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const supabase = createSupabaseServiceClient();
  const secret = request.headers.get('authorization')?.replace('Bearer ', '');
  if (secret !== (process.env.WEBHOOK_SECRET ?? '')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { data: charge } = await supabase
    .from('pix_charges')
    .select('*')
    .eq('invoice_id', params.invoiceId)
    .maybeSingle();
  if (!charge) {
    return NextResponse.json({ error: 'Cobrança não encontrada' }, { status: 404 });
  }
  await supabase
    .from('pix_charges')
    .update({ status: 'PAID', last_update_at: new Date().toISOString() })
    .eq('id', charge.id);
  await supabase
    .from('invoices')
    .update({ status: 'PAID', paid_at: new Date().toISOString() })
    .eq('id', params.invoiceId);
  const provider = resolvePixProvider();
  return NextResponse.json({
    success: true,
    webhook: {
      url: `/api/pix/webhook`,
      signatureHeader: provider.signatureHeaderName(),
    },
  });
}
