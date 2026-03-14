import paperCatalog from "../../../gcse_past_papers_grouped_by_subject_and_year.json";
import {
  LocalDatabase,
  Paper,
  PaperPerformance,
  Subject,
} from "@/lib/types";

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

export const subjectConfigs: SubjectConfig[] = [
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

export function normaliseSeries(series: string) {
  return series === "Nov" ? "November" : series;
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildPaperKey(
  subjectId: string,
  year: number,
  series: string,
  paperCode: string,
) {
  return `${subjectId}-${year}-${slugify(series)}-${slugify(paperCode)}`;
}

function buildSeriesLabel(year: number, series: string) {
  return `${series} ${year}`;
}

function comparePapers(left: Paper, right: Paper) {
  if (left.year !== right.year) {
    return right.year - left.year;
  }

  return right.seriesLabel.localeCompare(left.seriesLabel);
}

function getDefaultPerformance(): PaperPerformance {
  return {
    status: "Not Started",
    topicsForImprovement: [],
  };
}

function buildCatalogPaper(
  subjectId: string,
  year: number,
  paper: CatalogPaper,
  index: number,
): Paper {
  const series = normaliseSeries(paper.series);
  const paperId = `${buildPaperKey(subjectId, year, series, paper.paper_code)}-${index + 1}`;

  return {
    id: paperId,
    source: "catalog",
    year,
    series,
    seriesLabel: buildSeriesLabel(year, series),
    paperCode: paper.paper_code,
    assessmentComponent: paper.title,
    performance: getDefaultPerformance(),
  };
}

function buildSubject(config: SubjectConfig): Subject {
  const catalogYears = catalogSource.subjects[config.catalogLabel] ?? {};
  const papers = Object.entries(catalogYears)
    .flatMap(([year, items]) =>
      items.map((paper, index) =>
        buildCatalogPaper(config.id, Number(year), paper, index),
      ),
    )
    .sort(comparePapers);

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

export function buildBaseDatabase(): LocalDatabase {
  return {
    targetSeries: "Summer 2026",
    subjects: subjectConfigs.map(buildSubject),
  };
}

export function getSubjectConfig(subjectId: string) {
  return subjectConfigs.find((subject) => subject.id === subjectId);
}

export function comparePaperOrder(left: Paper, right: Paper) {
  return comparePapers(left, right);
}

export function buildCustomPaperId(
  subjectId: string,
  year: number,
  series: string,
  paperCode: string,
) {
  return `custom-${buildPaperKey(subjectId, year, series, paperCode)}-${Date.now()}`;
}
