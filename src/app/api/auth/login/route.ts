import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getAuthSettings,
} from "@/lib/auth";

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<{
    username: string;
    password: string;
  }>;
  const settings = getAuthSettings();

  if (!settings.username || !settings.password || !settings.secret) {
    return NextResponse.json(
      { error: "Login is not configured on this deployment." },
      { status: 500 },
    );
  }

  if (
    payload.username !== settings.username ||
    payload.password !== settings.password
  ) {
    return NextResponse.json({ error: "Invalid login details." }, { status: 401 });
  }

  const token = await createSessionToken(settings.username, settings.secret);
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
