import { NextResponse } from "next/server";
import type { MoodInput } from "@/types";
import { dsMoodPour, deepseekConfigured } from "@/lib/ai/deepseek";
import { offlineAI } from "@/lib/ai/cocktailAI";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const input = (await req.json().catch(() => ({}))) as MoodInput;
  const safe: MoodInput = { text: input?.text ?? "", tags: Array.isArray(input?.tags) ? input.tags : [] };
  if (deepseekConfigured) {
    try {
      return NextResponse.json(await dsMoodPour(safe));
    } catch (err) {
      console.warn("[api/mood-pour] DeepSeek failed, offline fallback:", err);
    }
  }
  return NextResponse.json(await offlineAI.generateFromMood(safe));
}
