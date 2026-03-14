import { NextResponse } from "next/server";
import {
  getCosmosDebugSettings,
  isCosmosConfigured,
  testCosmosConnection,
} from "@/lib/db/cosmos";

export async function GET() {
  const settings = getCosmosDebugSettings();

  if (!isCosmosConfigured()) {
    return NextResponse.json({
      ok: false,
      reason: "Cosmos DB is not configured.",
      settings,
    });
  }

  try {
    const result = await testCosmosConnection();

    return NextResponse.json({
      ok: true,
      settings,
      result,
    });
  } catch (error) {
    console.error("Cosmos debug check failed.", error);

    return NextResponse.json({
      ok: false,
      settings,
      error: error instanceof Error ? error.message : "Unexpected server error.",
      details:
        typeof error === "object" && error !== null
          ? JSON.parse(JSON.stringify(error))
          : null,
    });
  }
}
