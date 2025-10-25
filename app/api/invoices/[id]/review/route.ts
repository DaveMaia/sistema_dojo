import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session.academy_id || session.role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const body = await request.json();
  const payload = reviewSchema.parse(body);
  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();
  const review_status = payload.action === 'approve' ? 'APPROVED' : 'REJECTED';
  const status = payload.action === 'approve' ? 'PAID' : 'PENDING';
  const update = {
    review_status,
    reviewed_by: session.user_id,
    reviewed_at: now,
    review_reason: payload.reason ?? null,
    status,
  };
  const { error } = await supabase
    .from('invoices')
    .update(update)
    .eq('id', params.id)
    .eq('academy_id', session.academy_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
