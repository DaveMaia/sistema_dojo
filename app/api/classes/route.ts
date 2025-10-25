import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const querySchema = z.object({ scope: z.string().optional() });

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  capacity: z.number().int().min(1),
  instructor_user_id: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json([], { status: 200 });
  }
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const query = querySchema.parse(Object.fromEntries(searchParams.entries()));
  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .eq('academy_id', session.academy_id)
    .gte('start_time', new Date(Date.now() - 86400000).toISOString())
    .order('start_time', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!classes || classes.length === 0) {
    return NextResponse.json([]);
  }
  const ids = classes.map((cls) => cls.id);
  let reservations: Array<{ class_id: string; user_id: string }> = [];
  if (ids.length) {
    const { data, error: reservationsError } = await supabase
      .from('class_reservations')
      .select('class_id, user_id')
      .in('class_id', ids)
      .eq('academy_id', session.academy_id);
    if (reservationsError) {
      return NextResponse.json({ error: reservationsError.message }, { status: 500 });
    }
    reservations = data ?? [];
  }
  const grouped = new Map<string, { total: number; reservedByUser: boolean }>();
  for (const id of ids) {
    grouped.set(id, { total: 0, reservedByUser: false });
  }
  for (const reservation of reservations ?? []) {
    const entry = grouped.get(reservation.class_id) ?? { total: 0, reservedByUser: false };
    entry.total += 1;
    if (reservation.user_id === session.user_id) {
      entry.reservedByUser = true;
    }
    grouped.set(reservation.class_id, entry);
  }
  const filtered = classes.filter((cls) => {
    if (query.scope === 'me') {
      return grouped.get(cls.id)?.reservedByUser;
    }
    return true;
  });
  const formatted = filtered.map((cls) => ({
    id: cls.id,
    academy_id: cls.academy_id,
    title: cls.title,
    description: cls.description,
    start_time: cls.start_time,
    end_time: cls.end_time,
    instructor_user_id: cls.instructor_user_id,
    capacity: cls.capacity,
    reservations_count: grouped.get(cls.id)?.total ?? 0,
    is_reserved: grouped.get(cls.id)?.reservedByUser ?? false,
  }));
  return NextResponse.json(formatted);
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session.role === 'ATHLETE' || !session.academy_id) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const payload = createSchema.parse(await request.json());
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('classes').insert({
    academy_id: session.academy_id,
    ...payload,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
