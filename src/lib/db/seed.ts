import paperCatalog from "../../../gcse_past_papers_grouped_by_subject_and_year.json";
import { LocalDatabase, Paper, PaperPerformance, Subject } from "@/lib/types";

type CatalogPaper = {
  series: string;
  paper_code: string;
  title: string;
};

type CatalogSource = {
  subjects: Record<string, Record<string, CatalogPaper[]>>;
};

type SubjectConfig = Pick<
  Subject,
  "id" | "name" | "catalogLabel" | "examBoard" | "specificationCode" | "tier" | "route"
>;

const catalogSource = paperCatalog as CatalogSource;

const subjectConfigs: SubjectConfig[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    catalogLabel: "Mathematics (Pearson Edexcel 1MA1)",
    examBoard: "Pearson Edexcel",
    specificationCode: "1MA1",
    tier: "Higher Tier",
  },
  {
    id: "biology",
    name: "Biology",
    catalogLabel: "Biology (Pearson Edexcel 1BI0)",
    examBoard: "Pearson Edexcel",
    specificationCode: "1BI0",
    tier: "Higher Tier",
    route: "Triple Science",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    catalogLabel: "Chemistry (Pearson Edexcel 1CH0)",
    examBoard: "Pearson Edexcel",
    specificationCode: "1CH0",
    tier: "Higher Tier",
  },
  {
    id: "physics",
    name: "Physics",
    catalogLabel: "Physics (Pearson Edexcel 1PH0)",
    examBoard: "Pearson Edexcel",
    specificationCode: "1PH0",
    tier: "Higher Tier",
  },
  {
    id: "english-language",
    name: "English Language",
    catalogLabel: "English Language (Eduqas C700)",
    examBoard: "Eduqas",
    specificationCode: "C700",
  },
  {
    id: "english-literature",
    name: "English Literature",
    catalogLabel: "English Literature (Eduqas C720)",
    examBoard: "Eduqas",
    specificationCode: "C720",
  },
  {
    id: "geography",
    name: "Geography",
    catalogLabel: "Geography (OCR J384)",
    examBoard: "OCR",
    specificationCode: "J384",
    route: "Enquiring Minds",
  },
  {
    id: "classical-civilisation",
    name: "Classical Civilisation",
    catalogLabel: "Classical Civilisation (OCR J199)",
    examBoard: "OCR",
    specificationCode: "J199",
  },
  {
    id: "religious-studies",
    name: "Religious Studies",
    catalogLabel: "Religious Studies (AQA 8062)",
    examBoard: "AQA",
    specificationCode: "8062",
  },
  {
    id: "french",
    name: "French",
    catalogLabel: "French (Pearson Edexcel 1FR0 legacy papers for 2026 prep)",
    examBoard: "Pearson Edexcel",
    specificationCode: "1FR0",
    route: "Legacy specification for practice",
  },
  {
    id: "art-and-design",
    name: "Art and Design",
    catalogLabel: "Art and Design (AQA 8201)",
    examBoard: "AQA",
    specificationCode: "8201",
    route: "Externally Set Assignment",
  },
];

function normaliseSeries(series: string) {
  return series === "Nov" ? "November" : series;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildPaperKey(
  subjectId: string,
  year: number,
  series: string,
  paperCode: string,
) {
  return `${subjectId}-${year}-${slugify(series)}-${slugify(paperCode)}`;
}

const performanceSeed: Record<string, Partial<PaperPerformance>> = {
  [buildPaperKey("mathematics", 2024, "June", "1MA1/1H")]: {
    status: "Completed",
    score: 58,
    percentage: 73,
    grade: "7",
    topicsForImprovement: ["Functions and composite notation", "Circle theorems"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("mathematics", 2024, "June", "1MA1/2H")]: {
    status: "Completed",
    score: 61,
    percentage: 76,
    grade: "7",
    topicsForImprovement: ["Histograms", "Conditional probability tree diagrams"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("biology", 2024, "June", "1BI0/1H")]: {
    status: "Completed",
    score: 49,
    percentage: 49,
    grade: "6",
    topicsForImprovement: ["Required practical variables", "Osmosis data interpretation"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("chemistry", 2024, "June", "1CH0/1H")]: {
    status: "Completed",
    score: 55,
    percentage: 55,
    grade: "7",
    topicsForImprovement: ["Half equations", "Mole calculations"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("physics", 2024, "June", "1PH0/1H")]: {
    status: "Completed",
    score: 52,
    percentage: 52,
    grade: "6",
    topicsForImprovement: ["Circuit calculations", "Density required practical"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("english-language", 2024, "June", "C700U10-1")]: {
    status: "Completed",
    score: 64,
    percentage: 80,
    grade: "7",
    topicsForImprovement: ["Evaluation paragraph precision", "Transactional writing timing"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("english-literature", 2024, "June", "C720U10-1")]: {
    status: "Completed",
    score: 58,
    percentage: 72,
    grade: "6",
    topicsForImprovement: ["Context integration in Macbeth essays"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("geography", 2024, "June", "J384/01, 02, 03")]: {
    status: "Completed",
    score: 44,
    percentage: 63,
    grade: "6",
    topicsForImprovement: ["River hydrographs", "Weather hazard case study detail"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("classical-civilisation", 2024, "June", "J199/11 & 23")]: {
    status: "Completed",
    score: 39,
    percentage: 56,
    grade: "5",
    topicsForImprovement: ["Comparing hero archetypes", "Source-specific terminology"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("religious-studies", 2024, "June", "8062/1 & 2A")]: {
    status: "Completed",
    score: 71,
    percentage: 74,
    grade: "8",
    topicsForImprovement: ["12-mark evaluation structure"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("french", 2024, "June", "1FR0/1H, 3H, 4H")]: {
    status: "Completed",
    score: 41,
    percentage: 82,
    grade: "7",
    topicsForImprovement: ["Recognising past tense verbs in audio"],
    updatedAt: "2026-03-14",
  },
  [buildPaperKey("art-and-design", 2024, "Jan/June", "8201/X")]: {
    status: "Completed",
    grade: "On track",
    topicsForImprovement: ["Refine annotation quality before final piece"],
    notes: "Track prep studies, artist references, and final outcome progress.",
    updatedAt: "2026-03-14",
  },
};

function buildPaper(
  subjectId: string,
  year: number,
  paper: CatalogPaper,
  index: number,
): Paper {
  const series = normaliseSeries(paper.series);
  const performanceKey = buildPaperKey(subjectId, year, series, paper.paper_code);
  const performance = performanceSeed[performanceKey];

  return {
    id: `${performanceKey}-${index + 1}`,
    year,
    series,
    seriesLabel: `${series} ${year}`,
    paperCode: paper.paper_code,
    assessmentComponent: paper.title,
    performance: {
      status: performance?.status ?? "Not Started",
      score: performance?.score,
      percentage: performance?.percentage,
      grade: performance?.grade,
      topicsForImprovement: performance?.topicsForImprovement ?? [],
      notes: performance?.notes,
      updatedAt: performance?.updatedAt,
    },
  };
}

function buildSubject(config: SubjectConfig): Subject {
  const catalogYears = catalogSource.subjects[config.catalogLabel] ?? {};
  const papers = Object.entries(catalogYears).flatMap(([year, items]) =>
    items.map((paper, index) => buildPaper(config.id, Number(year), paper, index)),
  );

  return {
    id: config.id,
    name: config.name,
    catalogLabel: config.catalogLabel,
    examBoard: config.examBoard,
    specificationCode: config.specificationCode,
    tier: config.tier,
    route: config.route,
    targetSeries: "Summer 2026",
    papers,
  };
}

export const seedDatabase: LocalDatabase = {
  targetSeries: "Summer 2026",
  subjects: subjectConfigs.map(buildSubject),
};

export function getSubjectById(subjectId: string) {
  return seedDatabase.subjects.find((subject) => subject.id === subjectId);
}
