import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAttendanceToken } from '@/lib/utils/jwt';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/utils/rate-limit';

const schema = z.object({ token: z.string() });

export async function POST(request: Request) {
  enforceRateLimit('attendance:checkin');
  const supabase = createSupabaseServiceClient();
  const body = await request.json();
  const { token } = schema.parse(body);
  try {
    const payload = await verifyAttendanceToken(token);
    const studentId = payload.student_id as string;
    const academyId = Number(payload.academy_id);
    const jti = payload.jti as string;
    if (!studentId || Number.isNaN(academyId)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }
    const { error } = await supabase.from('attendances').insert({
      academy_id: academyId,
      student_id: studentId,
      class_date: new Date().toISOString(),
      class_type: 'AULA',
      instructor_user_id: null,
      source: 'QR',
      jti,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
  }
}
