"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Paper } from "@/lib/types";

type PaperProgressFormProps = {
  paper: Paper;
};

function topicsToText(topics: string[]) {
  return topics.join("\n");
}

export function PaperProgressForm({ paper }: PaperProgressFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(paper.performance.status);
  const [score, setScore] = useState(paper.performance.score?.toString() ?? "");
  const [percentage, setPercentage] = useState(
    paper.performance.percentage?.toString() ?? "",
  );
  const [grade, setGrade] = useState(paper.performance.grade ?? "");
  const [topics, setTopics] = useState(
    topicsToText(paper.performance.topicsForImprovement),
  );
  const [notes, setNotes] = useState(paper.performance.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const response = await fetch(`/api/papers/${paper.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        score: score === "" ? undefined : Number(score),
        percentage: percentage === "" ? undefined : Number(percentage),
        grade,
        topicsForImprovement: topics
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        notes,
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setMessage("Save failed. Please try again.");
      return;
    }

    setMessage("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm text-slate-200">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
          >
            <option value="Not Started">Not Started</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span>Score</span>
          <input
            value={score}
            onChange={(event) => setScore(event.target.value)}
            type="number"
            min="0"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
            placeholder="e.g. 58"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span>Percentage</span>
          <input
            value={percentage}
            onChange={(event) => setPercentage(event.target.value)}
            type="number"
            min="0"
            max="100"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
            placeholder="e.g. 73"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span>Grade</span>
          <input
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
            placeholder="e.g. 7"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Topics for improvement</span>
        <textarea
          value={topics}
          onChange={(event) => setTopics(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
          placeholder={"One topic per line\nSynoptic reasoning\nHistogram questions"}
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
          placeholder="Optional notes about timing, mistakes, or what to revisit."
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {message ?? "Edit the paper details and save them to the local tracker."}
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {isSaving ? "Saving..." : "Save paper"}
        </button>
      </div>
    </form>
  );
}
