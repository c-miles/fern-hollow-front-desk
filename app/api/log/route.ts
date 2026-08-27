import { NextResponse } from "next/server";
import { getLog } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getLog());
}
