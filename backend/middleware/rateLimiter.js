const rateLimitStore = new Map();

/**
 * Custom memory-based rate limiting middleware targeting requests per client IP.
 */
function customRateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 30; // 30 requests per minute

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const timestamps = rateLimitStore.get(ip);
  
  // Filter out timestamps older than 1 minute
  const activeTimestamps = timestamps.filter(t => now - t < WINDOW_MS);
  
  if (activeTimestamps.length >= MAX_REQUESTS) {
    console.warn(`[RATE LIMIT] IP ${ip} exceeded the rate limit threshold.`);
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  activeTimestamps.push(now);
  rateLimitStore.set(ip, activeTimestamps);
  next();
}

module.exports = customRateLimiter;
