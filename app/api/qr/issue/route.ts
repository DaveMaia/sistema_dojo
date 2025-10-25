import { NextResponse } from 'next/server';
import { create } from 'qrcode';
import { requireSession } from '@/lib/auth/session';
import { signAttendanceToken } from '@/lib/utils/jwt';
import { generateJti } from '@/lib/utils/id';

export async function POST() {
  const session = await requireSession();
  const jti = generateJti();
  const token = await signAttendanceToken({
    student_id: session.user_id,
    academy_id: session.academy_id,
    jti,
  });
  const qr = create(token, { type: 'svg', margin: 1, width: 256 });
  return NextResponse.json({
    token,
    qr_svg: qr.createSvgTag({ margin: 0, width: 256 }),
    jti,
  });
}
