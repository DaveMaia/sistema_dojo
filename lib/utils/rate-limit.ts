const buckets = new Map<string, { count: number; reset: number }>();

export function enforceRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return;
  }
  if (entry.count >= limit) {
    throw new Response('Too Many Requests', { status: 429 });
  }
  entry.count += 1;
}
