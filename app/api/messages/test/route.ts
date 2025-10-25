import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMessagingProvider } from '@/lib/providers/messaging';
import { requireSession } from '@/lib/auth/session';

const schema = z.object({ to: z.string(), template: z.string(), variables: z.record(z.string()).optional() });

export async function POST(request: Request) {
  await requireSession();
  const body = await request.json();
  const payload = schema.parse(body);
  const provider = getMessagingProvider();
  const result = await provider.send({ to: payload.to, template: payload.template, variables: payload.variables });
  return NextResponse.json({ success: true, id: result.id });
}
