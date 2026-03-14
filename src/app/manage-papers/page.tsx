import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { PaperManagementConsole } from "@/components/manage/paper-management-console";
import { loadTrackerSnapshot } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export default async function ManagePapersPage() {
  const snapshot = await loadTrackerSnapshot();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-fuchsia-950 p-6 shadow-2xl shadow-fuchsia-950/30 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Back to dashboard
          </Link>
          <div className="mt-3">
            <LogoutButton />
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-fuchsia-300">
              Paper Management
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Add, remove, and restore papers
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              This page controls which papers appear in the tracker. Use it to add custom
              papers, hide papers you do not want to track, or restore removed catalog entries.
            </p>
          </div>
        </section>

        <PaperManagementConsole
          subjects={snapshot.database.subjects}
          removedPapers={snapshot.removedPapers}
        />
      </div>
    </main>
  );
}
