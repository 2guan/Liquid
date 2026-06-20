import { NextResponse } from "next/server";
import type { FlavorPick } from "@/types";
import { dsZenMix, deepseekConfigured } from "@/lib/ai/deepseek";
import { offlineAI } from "@/lib/ai/cocktailAI";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { picks?: FlavorPick[] };
  const picks = Array.isArray(body.picks) ? body.picks : [];
  if (deepseekConfigured) {
    try {
      return NextResponse.json(await dsZenMix(picks));
    } catch (err) {
      console.warn("[api/zen-mix] DeepSeek failed, offline fallback:", err);
    }
  }
  return NextResponse.json(await offlineAI.analyzeFlavorMix(picks));
}
