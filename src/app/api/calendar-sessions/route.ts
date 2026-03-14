import { NextResponse } from "next/server";
import { addStudySession } from "@/lib/db/storage";
import { CreateStudySessionInput } from "@/lib/types";

function isCreateStudySessionInput(
  value: unknown,
): value is CreateStudySessionInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.paperId === "string" &&
    typeof candidate.date === "string" &&
    (candidate.notes === undefined || typeof candidate.notes === "string")
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!isCreateStudySessionInput(payload)) {
      return NextResponse.json(
        { error: "Invalid study session payload." },
        { status: 400 },
      );
    }

    await addStudySession(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to add study session.", error);
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
