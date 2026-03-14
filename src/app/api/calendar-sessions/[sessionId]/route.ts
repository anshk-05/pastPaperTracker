import { NextResponse } from "next/server";
import { deleteStudySession, updateStudySession } from "@/lib/db/storage";
import { UpdateStudySessionInput } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

function isUpdateStudySessionInput(
  value: unknown,
): value is UpdateStudySessionInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.date === "string" &&
    (candidate.notes === undefined || typeof candidate.notes === "string")
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const payload = await request.json();

    if (!isUpdateStudySessionInput(payload)) {
      return NextResponse.json(
        { error: "Invalid study session update." },
        { status: 400 },
      );
    }

    const { sessionId } = await context.params;
    await updateStudySession(sessionId, payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update study session.", error);
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    await deleteStudySession(sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete study session.", error);
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
