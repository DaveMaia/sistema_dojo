import { NextResponse } from 'next/server';
import { getMessagingProvider } from '@/lib/providers/messaging';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createSupabaseServiceClient();
  const now = new Date().toISOString();
  const { data: messages, error } = await supabase
    .from('message_outbox')
    .select('*')
    .lte('scheduled_at', now)
    .eq('status', 'SCHEDULED')
    .limit(20);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const provider = getMessagingProvider();
  const results: Array<{ id: string; success: boolean }> = [];
  for (const message of messages ?? []) {
    try {
      const result = await provider.send({ to: message.to_phone, template: message.event_type, variables: message.payload_json });
      await supabase
        .from('message_outbox')
        .update({ status: 'SENT', sent_at: new Date().toISOString(), provider_message_id: result.id })
        .eq('id', message.id);
      results.push({ id: message.id, success: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      await supabase
        .from('message_outbox')
        .update({ status: 'FAILED', error_text: errorMessage })
        .eq('id', message.id);
      results.push({ id: message.id, success: false });
    }
  }
  return NextResponse.json({ processed: results });
}
