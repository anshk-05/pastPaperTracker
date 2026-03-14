import { NextResponse } from "next/server";
import { addCustomPaper } from "@/lib/db/storage";
import { CreatePaperInput } from "@/lib/types";

function isCreatePaperInput(value: unknown): value is CreatePaperInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.subjectId === "string" &&
    typeof candidate.year === "number" &&
    typeof candidate.series === "string" &&
    typeof candidate.paperCode === "string" &&
    typeof candidate.assessmentComponent === "string"
  );
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (!isCreatePaperInput(payload)) {
    return NextResponse.json({ error: "Invalid paper payload." }, { status: 400 });
  }

  await addCustomPaper(payload);
  return NextResponse.json({ ok: true });
}
