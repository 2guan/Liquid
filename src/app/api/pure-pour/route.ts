import { NextResponse } from "next/server";
import type { GlassType, IceType } from "@/types";
import { dsPurePour, deepseekConfigured } from "@/lib/ai/deepseek";
import { offlineAI } from "@/lib/ai/cocktailAI";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    spiritId?: string;
    glass?: GlassType;
    ice?: IceType;
  };
  const spiritId = body.spiritId ?? "";
  const glass = (body.glass ?? "glencairn") as GlassType;
  const ice = (body.ice ?? "none") as IceType;
  if (deepseekConfigured) {
    try {
      return NextResponse.json(await dsPurePour(spiritId, glass, ice));
    } catch (err) {
      console.warn("[api/pure-pour] DeepSeek failed, offline fallback:", err);
    }
  }
  return NextResponse.json(await offlineAI.describePour(spiritId, glass, ice));
}
