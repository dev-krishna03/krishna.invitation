type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimit = { limit: number; windowMs: number };

export function rateLimit(key: string, cfg: RateLimit): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    const fresh: Bucket = { count: 1, resetAt: now + cfg.windowMs };
    buckets.set(key, fresh);
    return { allowed: true, remaining: cfg.limit - 1, resetAt: fresh.resetAt };
  }
  if (b.count >= cfg.limit) return { allowed: false, remaining: 0, resetAt: b.resetAt };
  b.count += 1;
  return { allowed: true, remaining: cfg.limit - b.count, resetAt: b.resetAt };
}

export const limits: Record<string, RateLimit> = {
  auth: { limit: 5, windowMs: 60_000 },
  payment: { limit: 10, windowMs: 60_000 },
  rsvp: { limit: 20, windowMs: 60_000 },
  webhook: { limit: 100, windowMs: 60_000 },
  default: { limit: 60, windowMs: 60_000 },
};

export function categoryForPath(pathname: string): keyof typeof limits {
  if (pathname.startsWith("/api/auth")) return "auth";
  if (pathname.startsWith("/api/payments")) return "payment";
  if (pathname.startsWith("/api/rsvp")) return "rsvp";
  if (pathname.startsWith("/api/webhooks")) return "webhook";
  return "default";
}
