import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import {
  AUTH_COOKIE_NAME,
  getAuthSettings,
  verifySessionToken,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const isAuthenticated = await verifySessionToken(
    cookieStore.get(AUTH_COOKIE_NAME)?.value,
  );

  if (isAuthenticated) {
    redirect("/");
  }

  const { studentName } = getAuthSettings();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        <section className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            GCSE Past Paper Tracker
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Revision tracking for {studentName}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            Sign in to see subject trackers, log paper scores, review weak topics,
            and keep progress synced through the app.
          </p>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-300">
              Before internet deployment, set your own values in the app settings for
              `APP_LOGIN_USERNAME`, `APP_LOGIN_PASSWORD`, and `APP_AUTH_SECRET`.
            </p>
          </div>
        </section>

        <LoginForm />
      </div>
    </main>
  );
}
