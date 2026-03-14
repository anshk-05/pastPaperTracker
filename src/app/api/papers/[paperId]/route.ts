import { NextResponse } from "next/server";
import { removePaper, updatePaperPerformance } from "@/lib/db/storage";
import { PaperFormValues } from "@/lib/types";

function isPaperFormValues(value: unknown): value is PaperFormValues {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    (candidate.status === "Not Started" || candidate.status === "Completed") &&
    Array.isArray(candidate.topicsForImprovement)
  );
}

type RouteContext = {
  params: Promise<{
    paperId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json();

  if (!isPaperFormValues(payload)) {
    return NextResponse.json({ error: "Invalid paper update." }, { status: 400 });
  }

  const { paperId } = await context.params;
  await updatePaperPerformance(paperId, payload);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { paperId } = await context.params;
  await removePaper(paperId);
  return NextResponse.json({ ok: true });
}
