import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./store";
import { BUSY_MESSAGE, RATE_LIMITED_MESSAGE } from "./limits";

const perMinute = new Ratelimit({ redis, prefix: "rl:chat:min", limiter: Ratelimit.slidingWindow(6, "1 m") });
const perHour = new Ratelimit({ redis, prefix: "rl:chat:hour", limiter: Ratelimit.slidingWindow(30, "1 h") });
const perDay = new Ratelimit({ redis, prefix: "rl:chat:day", limiter: Ratelimit.fixedWindow(200, "1 d") });

export async function chatLimitMessage(req: Request): Promise<string | null> {
  // Vercel overwrites these headers with the real client IP, so they can't be spoofed.
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  for (const limiter of [perMinute, perHour]) {
    if (!(await limiter.limit(ip)).success) return RATE_LIMITED_MESSAGE;
  }
  return (await perDay.limit("all")).success ? null : BUSY_MESSAGE;
}
