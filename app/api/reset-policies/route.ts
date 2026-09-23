import { savePolicies } from "@/lib/store";
import { seedPolicies } from "@/lib/seed";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await savePolicies(seedPolicies);
  return Response.json({ reset: seedPolicies.length });
}
