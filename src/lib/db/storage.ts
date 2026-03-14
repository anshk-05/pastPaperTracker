import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  buildBaseDatabase,
  buildCustomPaperId,
  comparePaperOrder,
  getSubjectConfig,
  normaliseSeries,
} from "@/lib/db/catalog";
import {
  CreatePaperInput,
  CreateStudySessionInput,
  CustomPaper,
  LocalDatabase,
  Paper,
  PaperFormValues,
  PaperPerformance,
  RemovedPaper,
  StudySession,
  StudySessionWithPaper,
  TrackerSnapshot,
  TrackerState,
  UpdateStudySessionInput,
} from "@/lib/types";
import {
  isCosmosConfigured,
  readTrackerStateFromCosmos,
  writeTrackerStateToCosmos,
} from "@/lib/db/cosmos";

const trackerStatePath = path.join(process.cwd(), "data", "tracker-state.json");

const defaultTrackerState: TrackerState = {
  progressByPaperId: {},
  removedPaperIds: [],
  customPapers: [],
  studySessions: [],
};

function cloneDefaultState(): TrackerState {
  return {
    progressByPaperId: {},
    removedPaperIds: [],
    customPapers: [],
    studySessions: [],
  };
}

async function ensureTrackerStateFile() {
  await fs.mkdir(path.dirname(trackerStatePath), { recursive: true });

  try {
    await fs.access(trackerStatePath);
  } catch {
    await fs.writeFile(
      trackerStatePath,
      JSON.stringify(defaultTrackerState, null, 2),
      "utf8",
    );
  }
}

async function readTrackerStateFromFile(): Promise<TrackerState> {
  await ensureTrackerStateFile();
  const fileContents = await fs.readFile(trackerStatePath, "utf8");

  try {
    const parsed = JSON.parse(fileContents) as Partial<TrackerState>;

    return {
      progressByPaperId: parsed.progressByPaperId ?? {},
      removedPaperIds: parsed.removedPaperIds ?? [],
      customPapers: parsed.customPapers ?? [],
      studySessions: parsed.studySessions ?? [],
    };
  } catch {
    return cloneDefaultState();
  }
}

async function writeTrackerStateToFile(state: TrackerState) {
  await ensureTrackerStateFile();
  await fs.writeFile(trackerStatePath, JSON.stringify(state, null, 2), "utf8");
}

async function readExistingTrackerStateFromFile() {
  try {
    const fileContents = await fs.readFile(trackerStatePath, "utf8");
    const parsed = JSON.parse(fileContents) as Partial<TrackerState>;

    return {
      progressByPaperId: parsed.progressByPaperId ?? {},
      removedPaperIds: parsed.removedPaperIds ?? [],
      customPapers: parsed.customPapers ?? [],
      studySessions: parsed.studySessions ?? [],
    };
  } catch {
    return null;
  }
}

export async function readTrackerState(): Promise<TrackerState> {
  if (isCosmosConfigured()) {
    try {
      const cosmosState = await readTrackerStateFromCosmos();

      if (cosmosState) {
        return cosmosState;
      }

      const seedState =
        process.env.NODE_ENV === "production"
          ? cloneDefaultState()
          : (await readExistingTrackerStateFromFile()) ?? cloneDefaultState();

      await writeTrackerStateToCosmos(seedState);
      return seedState;
    } catch (error) {
      console.error("Failed to read tracker state from Cosmos DB.", error);

      if (process.env.NODE_ENV === "production") {
        return cloneDefaultState();
      }

      return readTrackerStateFromFile();
    }
  }

  return readTrackerStateFromFile();
}

async function writeTrackerState(state: TrackerState) {
  if (isCosmosConfigured()) {
    await writeTrackerStateToCosmos(state);
    return;
  }

  await writeTrackerStateToFile(state);
}

function normalisePerformance(values: PaperFormValues): PaperPerformance {
  return {
    status: values.status,
    score: values.score,
    percentage: values.percentage,
    grade: values.grade?.trim() || undefined,
    topicsForImprovement: values.topicsForImprovement.filter(Boolean),
    notes: values.notes?.trim() || undefined,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

function applyProgressToPaper(
  paper: Paper,
  progressByPaperId: TrackerState["progressByPaperId"],
) {
  const saved = progressByPaperId[paper.id];

  if (!saved) {
    return paper;
  }

  return {
    ...paper,
    performance: {
      status: saved.status,
      score: saved.score,
      percentage: saved.percentage,
      grade: saved.grade,
      topicsForImprovement: saved.topicsForImprovement ?? [],
      notes: saved.notes,
      updatedAt: saved.updatedAt,
    },
  };
}

function mergeDatabase(baseDatabase: LocalDatabase, state: TrackerState): LocalDatabase {
  return {
    ...baseDatabase,
    subjects: baseDatabase.subjects.map((subject) => {
      const activeCatalogPapers = subject.papers
        .filter((paper) => !state.removedPaperIds.includes(paper.id))
        .map((paper) => applyProgressToPaper(paper, state.progressByPaperId));

      const customPapers = state.customPapers
        .filter((paper) => paper.subjectId === subject.id)
        .map((paper) => applyProgressToPaper(paper, state.progressByPaperId));

      return {
        ...subject,
        papers: [...activeCatalogPapers, ...customPapers].sort(comparePaperOrder),
      };
    }),
  };
}

function buildRemovedPapers(
  baseDatabase: LocalDatabase,
  state: TrackerState,
): RemovedPaper[] {
  return baseDatabase.subjects.flatMap((subject) =>
    subject.papers
      .filter((paper) => state.removedPaperIds.includes(paper.id))
      .map((paper) => ({
        subjectId: subject.id,
        subjectName: subject.name,
        paper: applyProgressToPaper(paper, state.progressByPaperId),
      })),
  );
}

function findPaperById(database: LocalDatabase, paperId: string) {
  for (const subject of database.subjects) {
    const paper = subject.papers.find((item) => item.id === paperId);

    if (paper) {
      return {
        paper,
        subjectId: subject.id,
        subjectName: subject.name,
      };
    }
  }

  return null;
}

function buildStudySessions(
  database: LocalDatabase,
  state: TrackerState,
): StudySessionWithPaper[] {
  return state.studySessions
    .map((session) => {
      const match = findPaperById(database, session.paperId);

      if (!match) {
        return null;
      }

      return {
        ...session,
        paper: match.paper,
        subjectId: match.subjectId,
        subjectName: match.subjectName,
      };
    })
    .filter((session): session is StudySessionWithPaper => session !== null)
    .sort((left, right) => {
      if (left.date !== right.date) {
        return left.date.localeCompare(right.date);
      }

      return left.paper.paperCode.localeCompare(right.paper.paperCode);
    });
}

export async function loadTrackerSnapshot(): Promise<TrackerSnapshot> {
  const baseDatabase = buildBaseDatabase();
  const state = await readTrackerState();
  const database = mergeDatabase(baseDatabase, state);

  return {
    database,
    removedPapers: buildRemovedPapers(baseDatabase, state).sort((left, right) =>
      comparePaperOrder(left.paper, right.paper),
    ),
    studySessions: buildStudySessions(database, state),
  };
}

export async function loadDatabase() {
  const snapshot = await loadTrackerSnapshot();
  return snapshot.database;
}

export async function getSubjectById(subjectId: string) {
  const database = await loadDatabase();
  return database.subjects.find((subject) => subject.id === subjectId);
}

export async function getPaperById(subjectId: string, paperId: string) {
  const subject = await getSubjectById(subjectId);

  if (!subject) {
    return null;
  }

  const paper = subject.papers.find((item) => item.id === paperId);

  if (!paper) {
    return null;
  }

  return { subject, paper };
}

export async function updatePaperPerformance(
  paperId: string,
  values: PaperFormValues,
) {
  const state = await readTrackerState();
  state.progressByPaperId[paperId] = normalisePerformance(values);
  await writeTrackerState(state);
}

export async function addCustomPaper(values: CreatePaperInput) {
  const state = await readTrackerState();
  const subject = getSubjectConfig(values.subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  const series = normaliseSeries(values.series.trim());
  const paper: CustomPaper = {
    id: buildCustomPaperId(
      values.subjectId,
      values.year,
      series,
      values.paperCode.trim(),
    ),
    subjectId: values.subjectId,
    source: "custom",
    year: values.year,
    series,
    seriesLabel: `${series} ${values.year}`,
    paperCode: values.paperCode.trim(),
    assessmentComponent: values.assessmentComponent.trim(),
    performance: {
      status: "Not Started",
      topicsForImprovement: [],
    },
  };

  state.customPapers.push(paper);
  await writeTrackerState(state);
}

export async function removePaper(paperId: string) {
  const state = await readTrackerState();
  const customPaperIndex = state.customPapers.findIndex((paper) => paper.id === paperId);

  if (customPaperIndex >= 0) {
    state.customPapers.splice(customPaperIndex, 1);
    delete state.progressByPaperId[paperId];
  } else if (!state.removedPaperIds.includes(paperId)) {
    state.removedPaperIds.push(paperId);
  }

  await writeTrackerState(state);
}

export async function restorePaper(paperId: string) {
  const state = await readTrackerState();
  state.removedPaperIds = state.removedPaperIds.filter((id) => id !== paperId);
  await writeTrackerState(state);
}

function buildStudySessionId() {
  return `study-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normaliseStudySessionDate(date: string) {
  return date.slice(0, 10);
}

export async function addStudySession(values: CreateStudySessionInput) {
  const state = await readTrackerState();
  const session: StudySession = {
    id: buildStudySessionId(),
    paperId: values.paperId,
    date: normaliseStudySessionDate(values.date),
    notes: values.notes?.trim() || undefined,
  };

  state.studySessions.push(session);
  await writeTrackerState(state);
}

export async function updateStudySession(
  sessionId: string,
  values: UpdateStudySessionInput,
) {
  const state = await readTrackerState();
  const session = state.studySessions.find((item) => item.id === sessionId);

  if (!session) {
    throw new Error("Study session not found");
  }

  session.date = normaliseStudySessionDate(values.date);
  session.notes = values.notes?.trim() || undefined;
  await writeTrackerState(state);
}

export async function deleteStudySession(sessionId: string) {
  const state = await readTrackerState();
  state.studySessions = state.studySessions.filter((item) => item.id !== sessionId);
  await writeTrackerState(state);
}
