"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RemovedPaper, Subject } from "@/lib/types";

type PaperManagementConsoleProps = {
  subjects: Subject[];
  removedPapers: RemovedPaper[];
};

export function PaperManagementConsole({
  subjects,
  removedPapers,
}: PaperManagementConsoleProps) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [year, setYear] = useState("2024");
  const [series, setSeries] = useState("June");
  const [paperCode, setPaperCode] = useState("");
  const [assessmentComponent, setAssessmentComponent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addPaper(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/papers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectId,
        year: Number(year),
        series,
        paperCode,
        assessmentComponent,
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setMessage("Could not add paper.");
      return;
    }

    setPaperCode("");
    setAssessmentComponent("");
    setMessage("Paper added");
    router.refresh();
  }

  async function removePaper(paperId: string) {
    const response = await fetch(`/api/papers/${paperId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Could not remove paper.");
      return;
    }

    router.refresh();
  }

  async function restorePaper(paperId: string) {
    const response = await fetch(`/api/papers/${paperId}/restore`, {
      method: "POST",
    });

    if (!response.ok) {
      setMessage("Could not restore paper.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
        <h2 className="text-2xl font-semibold text-white">Add a paper</h2>
        <p className="mt-2 text-sm text-slate-400">
          Use this if you want to track a paper that is not already in the main catalog.
        </p>

        <form onSubmit={addPaper} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm text-slate-200">
            <span>Subject</span>
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Year</span>
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
              type="number"
              min="2000"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Series</span>
            <input
              value={series}
              onChange={(event) => setSeries(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
              placeholder="June"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Paper code</span>
            <input
              value={paperCode}
              onChange={(event) => setPaperCode(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
              placeholder="1MA1/4H"
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Assessment component</span>
            <input
              value={assessmentComponent}
              onChange={(event) => setAssessmentComponent(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
              placeholder="Mock paper"
              required
            />
          </label>

          <div className="md:col-span-2 xl:col-span-5 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              {message ?? "New papers start as Not Started until a score is logged."}
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isSaving ? "Adding..." : "Add paper"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">{subject.name}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {subject.papers.length} tracked paper
                  {subject.papers.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {subject.papers.map((paper) => (
                <div
                  key={paper.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                        {paper.source}
                      </span>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                        {paper.seriesLabel}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-white">{paper.paperCode}</p>
                    <p className="text-sm text-slate-300">{paper.assessmentComponent}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePaper(paper.id)}
                    className="rounded-full border border-rose-500/40 px-4 py-2 text-sm font-medium text-rose-200 transition hover:border-rose-400 hover:text-white"
                  >
                    Remove from tracker
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
        <h2 className="text-2xl font-semibold text-white">Removed catalog papers</h2>
        <p className="mt-2 text-sm text-slate-400">
          Restoring a paper puts it back into the tracker with any saved progress intact.
        </p>

        <div className="mt-5 grid gap-3">
          {removedPapers.length > 0 ? (
            removedPapers.map(({ subjectName, paper }) => (
              <div
                key={paper.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm text-slate-400">{subjectName}</p>
                  <p className="text-lg font-semibold text-white">{paper.paperCode}</p>
                  <p className="text-sm text-slate-300">
                    {paper.seriesLabel} | {paper.assessmentComponent}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => restorePaper(paper.id)}
                  className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/30"
                >
                  Restore paper
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No catalog papers have been removed.</p>
          )}
        </div>
      </section>
    </div>
  );
}
