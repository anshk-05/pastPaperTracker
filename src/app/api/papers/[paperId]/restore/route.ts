import { NextResponse } from "next/server";
import { restorePaper } from "@/lib/db/storage";

type RouteContext = {
  params: Promise<{
    paperId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { paperId } = await context.params;
  await restorePaper(paperId);
  return NextResponse.json({ ok: true });
}
