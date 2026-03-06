import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** Chat API: 5 requests per 60-second sliding window */
export const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "ratelimit:chat",
});

/** Contact form: 3 submissions per 10-minute sliding window */
export const contactLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "600 s"),
  prefix: "ratelimit:contact",
});
