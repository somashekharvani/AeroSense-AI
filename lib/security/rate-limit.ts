interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const ipBuckets = new Map<string, RateLimitBucket>();

const MAX_TOKENS = 60; // Max requests per window
const REFILL_RATE_MS = 1000; // Refill 1 token per second (60 req/min)

/**
 * Checks if a client IP is within allowed rate limits
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let bucket = ipBuckets.get(ip);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS - 1, lastRefill: now };
    ipBuckets.set(ip, bucket);
    return { allowed: true, remaining: bucket.tokens };
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / REFILL_RATE_MS);

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return { allowed: true, remaining: bucket.tokens };
  }

  return { allowed: false, remaining: 0 };
}
