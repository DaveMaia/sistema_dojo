import { NextResponse } from 'next/server';
import { create } from 'qrcode';
import { requireSession } from '@/lib/auth/session';
import { signAttendanceToken } from '@/lib/utils/jwt';
import { generateJti } from '@/lib/utils/id';

export async function GET() {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json(null);
  }
  return NextResponse.json(null);
}

export async function POST() {
  const session = await requireSession();
  if (!session.academy_id) {
    return NextResponse.json({ error: 'Associe-se a uma academia' }, { status: 400 });
  }
  const jti = generateJti();
  const token = await signAttendanceToken({
    student_id: session.user_id,
    academy_id: session.academy_id,
    jti,
  });
  const qr = create(token, { type: 'svg', margin: 1, width: 256 });
  const svg = qr.createSvgTag({ margin: 0, width: 256 });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  return NextResponse.json({ qr_svg: svg, jti, expires_at: expiresAt });
}
