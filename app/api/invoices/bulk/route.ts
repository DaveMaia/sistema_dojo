import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const bulkSchema = z.object({
  student_ids: z.array(z.string().uuid()),
  due_date: z.string(),
  amount_numeric: z.number().positive(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session.academy_id || session.role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const body = await request.json();
  const payload = bulkSchema.parse(body);
  const supabase = createSupabaseServerClient();
  const rows = payload.student_ids.map((studentId) => ({
    academy_id: session.academy_id,
    student_id: studentId,
    due_date: payload.due_date,
    amount_numeric: payload.amount_numeric,
    notes: payload.notes ?? null,
    status: 'PENDING',
    review_status: 'NONE',
  }));
  const { error } = await supabase.from('invoices').insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, count: rows.length });
}
