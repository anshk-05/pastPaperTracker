import { NextResponse } from "next/server";
import { restorePaper } from "@/lib/db/storage";

type RouteContext = {
  params: Promise<{
    paperId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { paperId } = await context.params;
    await restorePaper(paperId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to restore paper.", error);
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
