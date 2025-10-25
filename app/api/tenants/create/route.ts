import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/auth/session';

const schema = z.object({ name: z.string().min(3) });

export async function POST(request: Request) {
  const session = await requireSession();
  const body = await request.json();
  const payload = schema.parse(body);
  const supabase = createSupabaseServerClient();
  const { data: existing } = await supabase
    .from('profiles')
    .select('academy_id')
    .eq('user_id', session.user_id)
    .maybeSingle();
  if (existing?.academy_id) {
    return NextResponse.json({ error: 'Usuário já vinculado a uma academia' }, { status: 400 });
  }
  const adminClient = createSupabaseServiceClient();
  const { data: academy, error } = await adminClient
    .from('academies')
    .insert({ name: payload.name, owner_user_id: session.user_id })
    .select('id')
    .single();
  if (error || !academy) {
    return NextResponse.json({ error: error?.message || 'Erro ao criar academia' }, { status: 400 });
  }
  await adminClient
    .from('profiles')
    .upsert({ user_id: session.user_id, academy_id: academy.id, role: 'ADMIN' });
  await adminClient.from('payment_settings').insert({ academy_id: academy.id, pix_key: '', pix_receiver_name: '', pix_city: '' });
  await adminClient.from('plans').insert({ academy_id: academy.id, name: 'Plano Mensal', price_numeric: 14900 });
  await adminClient.from('message_templates').insert([
    {
      academy_id: academy.id,
      event_type: 'INVOICE_DUE_3D',
      template_text: 'Oss! Sua mensalidade vence em 3 dias. Link: {{pix}}',
    },
    {
      academy_id: academy.id,
      event_type: 'INVOICE_DUE_0D',
      template_text: 'Hoje é o dia! Garanta o treino em dia pagando sua mensalidade.',
    },
  ]);
  return NextResponse.json({ success: true, academy_id: academy.id });
}
