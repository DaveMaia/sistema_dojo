import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { paymentSettingsSchema } from '@/features/payments_pix/schemas';

export async function GET() {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json({ error: 'Associe-se a uma academia primeiro.' }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('academy_id', session.academy_id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (session.role !== 'ADMIN' || !session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const body = await request.json();
  const payload = paymentSettingsSchema.parse(body);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('payment_settings')
    .upsert({
      academy_id: session.academy_id,
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('academy_id', session.academy_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
