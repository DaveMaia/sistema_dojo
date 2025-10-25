import { NextResponse } from 'next/server';
import { resolvePixProvider } from '@/features/payments_pix/provider';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  enforceRateLimit('pix:webhook', 20, 60_000);
  const provider = resolvePixProvider();
  const rawBody = await request.text();
  const cloned = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: rawBody,
  });
  const validation = await provider.verifyWebhook(cloned);
  if (!validation.valid) {
    return NextResponse.json({ error: 'assinatura inválida' }, { status: 401 });
  }
  let payload: unknown = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: 'payload inválido' }, { status: 400 });
  }
  const supabase = createSupabaseServiceClient();
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('event_id', validation.eventId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ success: true, duplicate: true });
  }
  let academyId: number | null = null;
  const { data: charge } = await supabase
    .from('pix_charges')
    .select('*')
    .eq('provider_charge_id', validation.providerChargeId)
    .maybeSingle();
  if (charge) {
    academyId = charge.academy_id;
  }
  await supabase.from('webhook_events').insert({
    academy_id: academyId,
    provider: process.env.PIX_PROVIDER ?? 'MOCK',
    event_id: validation.eventId,
    signature: request.headers.get(provider.signatureHeaderName()) ?? '',
    payload_json: payload,
  });
  if (charge) {
    await supabase
      .from('pix_charges')
      .update({ status: validation.status === 'PAID' ? 'PAID' : charge.status, last_update_at: new Date().toISOString() })
      .eq('id', charge.id);
    if (validation.status === 'PAID') {
      await supabase
        .from('invoices')
        .update({ status: 'PAID', paid_at: new Date().toISOString() })
        .eq('id', charge.invoice_id);
    }
  }
  return NextResponse.json({ success: true });
}
