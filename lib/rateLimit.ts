const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

export function getRateLimitRemaining(key: string, maxRequests: number = 10): number {
  const entry = requestCounts.get(key);
  if (!entry) return maxRequests;
  if (Date.now() > entry.resetAt) return maxRequests;
  return Math.max(0, maxRequests - entry.count);
}
