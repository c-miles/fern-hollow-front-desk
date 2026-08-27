import { NextResponse } from "next/server";
import { getPolicies, savePolicies } from "@/lib/store";
import type { Policy } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getPolicies());
}

export async function PUT(req: Request) {
  const policies = (await req.json()) as Policy[];
  if (!Array.isArray(policies) || policies.some((p) => !p.id || !p.title || typeof p.body !== "string")) {
    return NextResponse.json({ error: "invalid policies payload" }, { status: 400 });
  }
  await savePolicies(policies);
  return NextResponse.json({ ok: true });
}
