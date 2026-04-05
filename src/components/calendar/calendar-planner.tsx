"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { StudySessionWithPaper, Subject } from "@/lib/types";

type CalendarPlannerProps = {
  subjects: Subject[];
  studySessions: StudySessionWithPaper[];
};

type SessionStatus = "idle" | "saving";

function parseYmd(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatYmd(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHumanDate(dateString: string) {
  return parseYmd(dateString).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function buildMonthDays(currentMonth: Date) {
  const start = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const startOffset = (start.getDay() + 6) % 7;
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function buildStatusClass(isCurrentMonth: boolean) {
  return isCurrentMonth ? "text-white" : "text-slate-500";
}

function statusBadgeClass(status: string) {
  return status === "Completed"
    ? "bg-emerald-500/15 text-emerald-300"
    : "bg-amber-500/15 text-amber-200";
}

function getLatestYear(subject: Subject | undefined) {
  if (!subject || subject.papers.length === 0) {
    return "";
  }

  return `${Math.max(...subject.papers.map((paper) => paper.year))}`;
}

export function CalendarPlanner({
  subjects,
  studySessions,
}: CalendarPlannerProps) {
  const router = useRouter();
  const today = new Date();
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? "");
  const [activeMonth, setActiveMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedYear, setSelectedYear] = useState(
    getLatestYear(subjects[0]),
  );
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
  const availableYears = useMemo(
    () =>
      Array.from(
        new Set((selectedSubject?.papers ?? []).map((paper) => `${paper.year}`)),
      ).sort((left, right) => Number(right) - Number(left)),
    [selectedSubject],
  );
  const availablePapers = useMemo(
    () =>
      (selectedSubject?.papers ?? []).filter(
        (paper) => `${paper.year}` === selectedYear,
      ),
    [selectedSubject, selectedYear],
  );
  const [paperId, setPaperId] = useState("");
  const [date, setDate] = useState(formatYmd(today));
  const [notes, setNotes] = useState("");
  const [plannerMessage, setPlannerMessage] = useState<string | null>(null);
  const [plannerStatus, setPlannerStatus] = useState<SessionStatus>("idle");
  const [sessionMessages, setSessionMessages] = useState<Record<string, string>>(
    {},
  );

  const days = buildMonthDays(activeMonth);
  const sessionsByDate = studySessions.reduce<Record<string, StudySessionWithPaper[]>>(
    (groups, session) => {
      if (!groups[session.date]) {
        groups[session.date] = [];
      }

      groups[session.date].push(session);
      return groups;
    },
    {},
  );

  const upcomingSessions = [...studySessions]
    .filter((session) => session.date >= formatYmd(today))
    .slice(0, 8);

  useEffect(() => {
    if (!selectedSubject) {
      if (selectedYear !== "") {
        setSelectedYear("");
      }
      if (paperId !== "") {
        setPaperId("");
      }
      return;
    }

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(getLatestYear(selectedSubject));
      return;
    }

    if (paperId === "" || !availablePapers.find((paper) => paper.id === paperId)) {
      setPaperId(availablePapers[0]?.id ?? "");
    }
  }, [availablePapers, availableYears, paperId, selectedSubject, selectedYear]);

  async function addSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlannerStatus("saving");
    setPlannerMessage(null);

    try {
      const response = await fetch("/api/calendar-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paperId,
          date,
          notes,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setPlannerMessage(payload?.error ?? "Could not add study session.");
        return;
      }

      setNotes("");
      setPlannerMessage("Session added");
      router.refresh();
    } catch {
      setPlannerMessage(
        "Could not add the study session right now. Check the connection and try again.",
      );
    } finally {
      setPlannerStatus("idle");
    }
  }

  async function updateSession(
    sessionId: string,
    nextDate: string,
    nextNotes: string,
  ) {
    try {
      const response = await fetch(`/api/calendar-sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: nextDate,
          notes: nextNotes,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSessionMessages((current) => ({
          ...current,
          [sessionId]: payload?.error ?? "Could not update session.",
        }));
        return;
      }

      setSessionMessages((current) => ({
        ...current,
        [sessionId]: "Saved",
      }));
      router.refresh();
    } catch {
      setSessionMessages((current) => ({
        ...current,
        [sessionId]:
          "Could not update the session right now. Check the connection and try again.",
      }));
    }
  }

  async function deleteSession(sessionId: string) {
    try {
      const response = await fetch(`/api/calendar-sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSessionMessages((current) => ({
          ...current,
          [sessionId]: payload?.error ?? "Could not delete session.",
        }));
        return;
      }

      router.refresh();
    } catch {
      setSessionMessages((current) => ({
        ...current,
        [sessionId]:
          "Could not delete the session right now. Check the connection and try again.",
      }));
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 shadow-2xl shadow-emerald-950/30 sm:p-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Back to dashboard
            </Link>
            <Link
              href="/manage-papers"
              className="inline-flex items-center rounded-full border border-emerald-600/50 px-4 py-2 text-sm text-emerald-100 transition hover:border-emerald-400 hover:text-white"
            >
              Manage papers
            </Link>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-300">
                Calendar Planner
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Plan papers by day
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Schedule which past paper to tackle on each date, then open the
                paper tracker directly from the calendar to log scores and notes.
              </p>
            </div>

            <form
              onSubmit={addSession}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
            >
              <h2 className="text-xl font-semibold text-white">Add study session</h2>
              <div className="mt-4 grid gap-4">
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Subject</span>
                  <select
                    value={selectedSubjectId}
                    onChange={(event) => {
                      const nextSubjectId = event.target.value;
                      const nextSubject = subjects.find(
                        (subject) => subject.id === nextSubjectId,
                      );
                      const nextYear = getLatestYear(nextSubject);
                      const nextPaper =
                        nextSubject?.papers.find(
                          (paper) => `${paper.year}` === nextYear,
                        )?.id ?? "";

                      setSelectedSubjectId(nextSubjectId);
                      setSelectedYear(nextYear);
                      setPaperId(nextPaper);
                    }}
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
                  <select
                    value={selectedYear}
                    onChange={(event) => {
                      const nextYear = event.target.value;
                      const nextPaper =
                        (selectedSubject?.papers ?? []).find(
                          (paper) => `${paper.year}` === nextYear,
                        )?.id ?? "";

                      setSelectedYear(nextYear);
                      setPaperId(nextPaper);
                    }}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Paper</span>
                  <select
                    value={paperId}
                    onChange={(event) => setPaperId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                  >
                    {availablePapers.map((paperOption) => (
                      <option key={paperOption.id} value={paperOption.id}>
                        {paperOption.paperCode} | {paperOption.assessmentComponent}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Session notes</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                    placeholder="Optional reminder, target topic, or timing goal."
                  />
                </label>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">
                  {plannerMessage ??
                    (paperId
                      ? "Add a paper to a date in the calendar."
                      : "Choose a subject, year, and paper to plan a session.")}
                </p>
                <button
                  type="submit"
                  disabled={plannerStatus === "saving" || !paperId}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600"
                >
                  {plannerStatus === "saving" ? "Saving..." : "Add to calendar"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {monthLabel(activeMonth)}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Click into a planned paper to log the score after the session.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMonth(
                      new Date(
                        activeMonth.getFullYear(),
                        activeMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveMonth(
                      new Date(
                        activeMonth.getFullYear(),
                        activeMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
              {days.map((day) => {
                const ymd = formatYmd(day);
                const isCurrentMonth = day.getMonth() === activeMonth.getMonth();
                const sessions = sessionsByDate[ymd] ?? [];

                return (
                  <div
                    key={ymd}
                    className="min-h-40 rounded-2xl border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${buildStatusClass(isCurrentMonth)}`}>
                        {day.getDate()}
                      </p>
                      {sessions.length > 0 ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">
                          {sessions.length}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${statusBadgeClass(
                                session.paper.performance.status,
                              )}`}
                            >
                              {session.paper.performance.status}
                            </span>
                            {session.paper.performance.score != null ? (
                              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                                {session.paper.performance.score}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {session.paper.paperCode}
                          </p>
                          <p className="text-xs text-slate-400">
                            {session.subjectName}
                          </p>
                          <Link
                            href={`/subjects/${session.subjectId}/papers/${session.paperId}`}
                            className="mt-2 inline-flex text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
                          >
                            Open paper
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
              <h2 className="text-2xl font-semibold text-white">Upcoming plan</h2>
              <div className="mt-5 space-y-3">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <EditableSessionCard
                      key={session.id}
                      session={session}
                      message={sessionMessages[session.id]}
                      onSave={updateSession}
                      onDelete={deleteSession}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No sessions planned yet. Add a paper to the calendar to get started.
                  </p>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

type EditableSessionCardProps = {
  session: StudySessionWithPaper;
  message?: string;
  onSave: (sessionId: string, date: string, notes: string) => Promise<void>;
  onDelete: (sessionId: string) => Promise<void>;
};

function EditableSessionCard({
  session,
  message,
  onSave,
  onDelete,
}: EditableSessionCardProps) {
  const [date, setDate] = useState(session.date);
  const [notes, setNotes] = useState(session.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await onSave(session.id, date, notes);
    setIsSaving(false);
  }

  async function handleDelete() {
    setIsSaving(true);
    await onDelete(session.id);
    setIsSaving(false);
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{formatHumanDate(session.date)}</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {session.paper.paperCode}
          </p>
          <p className="text-sm text-slate-300">{session.subjectName}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm ${statusBadgeClass(
            session.paper.performance.status,
          )}`}
        >
          {session.paper.performance.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-300">
        {session.paper.assessmentComponent}
      </p>

      <div className="mt-4 grid gap-3">
        <label className="space-y-2 text-sm text-slate-200">
          <span>Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          <span>Session notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{message ?? " "}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/subjects/${session.subjectId}/papers/${session.paperId}`}
            className="rounded-full border border-emerald-600/40 px-4 py-2 text-sm text-emerald-200 transition hover:border-emerald-400 hover:text-white"
          >
            Open paper
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="rounded-full border border-rose-500/40 px-4 py-2 text-sm text-rose-200 transition hover:border-rose-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
