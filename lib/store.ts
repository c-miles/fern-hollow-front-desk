import { Redis } from "@upstash/redis";
import { seedPolicies } from "./seed";
import type { Policy, LogEntry } from "./types";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const POLICIES_KEY = "policies";
const LOG_KEY = "question_log";

export async function getPolicies(): Promise<Policy[]> {
  const stored = await redis.get<Policy[]>(POLICIES_KEY);
  if (stored && stored.length > 0) return stored;
  await redis.set(POLICIES_KEY, seedPolicies);
  return seedPolicies;
}

export async function savePolicies(policies: Policy[]): Promise<void> {
  await redis.set(POLICIES_KEY, policies);
}

export async function logQuestion(entry: Omit<LogEntry, "id" | "createdAt">): Promise<void> {
  const full: LogEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  await redis.lpush(LOG_KEY, full);
  await redis.ltrim(LOG_KEY, 0, 199);
}

export async function getLog(): Promise<LogEntry[]> {
  return (await redis.lrange<LogEntry>(LOG_KEY, 0, 49)) ?? [];
}
