import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  to_phone: z.string(),
  event_type: z.string(),
  scheduled_at: z.string().optional(),
  payload_json: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const body = await request.json();
  const payload = schema.parse(body);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('message_outbox').insert({
    academy_id: session.academy_id,
    to_phone: payload.to_phone,
    event_type: payload.event_type,
    payload_json: payload.payload_json ?? {},
    scheduled_at: payload.scheduled_at ?? new Date().toISOString(),
    status: 'SCHEDULED',
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
