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
  CustomPaper,
  LocalDatabase,
  Paper,
  PaperFormValues,
  PaperPerformance,
  RemovedPaper,
  TrackerSnapshot,
  TrackerState,
} from "@/lib/types";

const trackerStatePath = path.join(process.cwd(), "data", "tracker-state.json");

const defaultTrackerState: TrackerState = {
  progressByPaperId: {},
  removedPaperIds: [],
  customPapers: [],
};

function cloneDefaultState(): TrackerState {
  return {
    progressByPaperId: {},
    removedPaperIds: [],
    customPapers: [],
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

export async function readTrackerState(): Promise<TrackerState> {
  await ensureTrackerStateFile();
  const fileContents = await fs.readFile(trackerStatePath, "utf8");

  try {
    const parsed = JSON.parse(fileContents) as Partial<TrackerState>;

    return {
      progressByPaperId: parsed.progressByPaperId ?? {},
      removedPaperIds: parsed.removedPaperIds ?? [],
      customPapers: parsed.customPapers ?? [],
    };
  } catch {
    return cloneDefaultState();
  }
}

async function writeTrackerState(state: TrackerState) {
  await ensureTrackerStateFile();
  await fs.writeFile(trackerStatePath, JSON.stringify(state, null, 2), "utf8");
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

export async function loadTrackerSnapshot(): Promise<TrackerSnapshot> {
  const baseDatabase = buildBaseDatabase();
  const state = await readTrackerState();

  return {
    database: mergeDatabase(baseDatabase, state),
    removedPapers: buildRemovedPapers(baseDatabase, state).sort((left, right) =>
      comparePaperOrder(left.paper, right.paper),
    ),
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
