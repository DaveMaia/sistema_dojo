import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const querySchema = z.object({
  status: z.string().optional(),
  review_status: z.string().optional(),
  q: z.string().optional(),
  month: z.string().optional(),
  mine: z.string().optional(),
});

const createInvoiceSchema = z.object({
  student_id: z.string().uuid(),
  due_date: z.string(),
  amount_numeric: z.number().positive(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json({ error: 'Associe-se a uma academia' }, { status: 400 });
  }
  const { searchParams } = new URL(request.url);
  const query = querySchema.parse(Object.fromEntries(searchParams.entries()));
  const supabase = createSupabaseServerClient();
  let builder = supabase
    .from('invoices')
    .select('*, student:students(id, name), invoice_pix(txid, brcode_payload, qr_svg, status, proof_url)')
    .eq('academy_id', session.academy_id)
    .order('due_date', { ascending: true });

  if (query.mine === '1' || session.role === 'ATHLETE') {
    builder = builder.eq('student_id', session.user_id);
  }
  if (query.status) {
    builder = builder.eq('status', query.status);
  }
  if (query.review_status) {
    builder = builder.eq('review_status', query.review_status);
  }
  if (query.q) {
    builder = builder.ilike('notes', `%${query.q}%`);
  }
  if (query.month) {
    builder = builder.gte('due_date', `${query.month}-01`).lte('due_date', `${query.month}-31`);
  }

  const { data, error } = await builder;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session.role !== 'ADMIN' || !session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const body = await request.json();
  const payload = createInvoiceSchema.parse(body);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('invoices').insert({
    academy_id: session.academy_id,
    ...payload,
    status: 'PENDING',
    review_status: 'NONE',
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
