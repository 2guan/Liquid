import { NextResponse } from "next/server";
import type { Recipe } from "@/types";
import { dsMixology, deepseekConfigured } from "@/lib/ai/deepseek";
import { offlineAI } from "@/lib/ai/cocktailAI";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    recipe?: Recipe;
    success?: boolean;
    accuracy?: number;
  };
  const recipe = body?.recipe;
  if (!recipe || !Array.isArray(recipe.ingredients)) {
    return NextResponse.json({ error: "missing recipe" }, { status: 400 });
  }
  const success = Boolean(body.success);
  const accuracy = Number.isFinite(body.accuracy) ? Number(body.accuracy) : 0;

  if (deepseekConfigured) {
    try {
      return NextResponse.json(await dsMixology(recipe, success, accuracy));
    } catch (err) {
      console.warn("[api/mixology] DeepSeek failed, offline fallback:", err);
    }
  }
  return NextResponse.json(await offlineAI.describeMix(recipe, success, accuracy));
}
