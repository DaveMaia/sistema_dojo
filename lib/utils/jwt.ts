import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.JWT_HMAC_SECRET || 'dojo-secret');

export async function signAttendanceToken(payload: Record<string, unknown>, expiresIn = '10m') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret());
}

export async function verifyAttendanceToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  return payload;
}
