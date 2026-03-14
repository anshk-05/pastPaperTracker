import { LocalDatabase, Paper, Subject } from "@/lib/types";

type PaperSeed = {
  code: string;
  name: string;
  assessmentWindow: string;
  status?: Paper["status"];
  score?: number;
  maxScore?: number;
  grade?: string;
  reviewTopics?: string[];
  notes?: string;
};

function buildPapers(subjectId: string, papers: PaperSeed[]): Paper[] {
  return papers.map((paper, index) => ({
    id: `${subjectId}-paper-${index + 1}`,
    paperCode: paper.code,
    paperName: paper.name,
    assessmentWindow: paper.assessmentWindow,
    status: paper.status ?? "Not Started",
    score: paper.score,
    maxScore: paper.maxScore,
    grade: paper.grade,
    reviewTopics: paper.reviewTopics ?? [],
    notes: paper.notes,
    updatedAt: "2026-03-14",
  }));
}

function buildSubject(
  id: string,
  name: string,
  examBoard: string,
  specificationCode: string,
  papers: PaperSeed[],
  options?: Pick<Subject, "tier" | "route">,
): Subject {
  return {
    id,
    name,
    examBoard,
    specificationCode,
    tier: options?.tier,
    route: options?.route,
    targetSeries: "Summer 2026",
    papers: buildPapers(id, papers),
  };
}

export const seedDatabase: LocalDatabase = {
  targetSeries: "Summer 2026",
  subjects: [
    buildSubject(
      "mathematics",
      "Mathematics",
      "Pearson Edexcel",
      "1MA1",
      [
        {
          code: "1MA1-1H",
          name: "Paper 1 (Non-Calculator)",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 58,
          maxScore: 80,
          grade: "7",
          reviewTopics: ["Functions and composite notation", "Circle theorems"],
        },
        {
          code: "1MA1-2H",
          name: "Paper 2 (Calculator)",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 61,
          maxScore: 80,
          grade: "7",
          reviewTopics: ["Histograms", "Conditional probability tree diagrams"],
        },
        {
          code: "1MA1-3H",
          name: "Paper 3 (Calculator)",
          assessmentWindow: "Summer 2024",
        },
      ],
      { tier: "Higher Tier" },
    ),
    buildSubject(
      "biology",
      "Biology",
      "Pearson Edexcel",
      "1BI0",
      [
        {
          code: "1BI0-1H",
          name: "Paper 1",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 49,
          maxScore: 100,
          grade: "6",
          reviewTopics: ["Required practical variables", "Osmosis data interpretation"],
        },
        {
          code: "1BI0-2H",
          name: "Paper 2",
          assessmentWindow: "Summer 2024",
        },
      ],
      { tier: "Higher Tier", route: "Triple Science" },
    ),
    buildSubject(
      "chemistry",
      "Chemistry",
      "Pearson Edexcel",
      "1CH0",
      [
        {
          code: "1CH0-1H",
          name: "Paper 1",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 55,
          maxScore: 100,
          grade: "7",
          reviewTopics: ["Half equations", "Mole calculations"],
        },
        {
          code: "1CH0-2H",
          name: "Paper 2",
          assessmentWindow: "Summer 2024",
        },
      ],
      { tier: "Higher Tier" },
    ),
    buildSubject(
      "physics",
      "Physics",
      "Pearson Edexcel",
      "1PH0",
      [
        {
          code: "1PH0-1H",
          name: "Paper 1",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 52,
          maxScore: 100,
          grade: "6",
          reviewTopics: ["Circuit calculations", "Density required practical"],
        },
        {
          code: "1PH0-2H",
          name: "Paper 2",
          assessmentWindow: "Summer 2024",
        },
      ],
      { tier: "Higher Tier" },
    ),
    buildSubject(
      "english-language",
      "English Language",
      "Eduqas",
      "C700",
      [
        {
          code: "C700U10-1",
          name: "Component 1",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 64,
          maxScore: 80,
          grade: "7",
          reviewTopics: ["Evaluation paragraph precision", "Transactional writing timing"],
        },
        {
          code: "C700U20-1",
          name: "Component 2",
          assessmentWindow: "Summer 2024",
        },
      ],
    ),
    buildSubject(
      "english-literature",
      "English Literature",
      "Eduqas",
      "C720",
      [
        {
          code: "C720U10-1",
          name: "Component 1",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 58,
          maxScore: 80,
          grade: "6",
          reviewTopics: ["Context integration in Macbeth essays"],
        },
        {
          code: "C720U20-1",
          name: "Component 2",
          assessmentWindow: "Summer 2024",
        },
      ],
    ),
    buildSubject(
      "geography",
      "Geography",
      "OCR",
      "J384",
      [
        {
          code: "J384-01",
          name: "Our Natural World",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 44,
          maxScore: 70,
          grade: "6",
          reviewTopics: ["River hydrographs", "Weather hazard case study detail"],
        },
        {
          code: "J384-02",
          name: "People and Society",
          assessmentWindow: "Summer 2024",
        },
        {
          code: "J384-03",
          name: "Geographical Exploration",
          assessmentWindow: "Summer 2024",
        },
      ],
      { route: "Enquiring Minds" },
    ),
    buildSubject(
      "classical-civilisation",
      "Classical Civilisation",
      "OCR",
      "J199",
      [
        {
          code: "J199-11",
          name: "Myth and Religion",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 39,
          maxScore: 70,
          grade: "5",
          reviewTopics: ["Comparing hero archetypes", "Source-specific terminology"],
        },
        {
          code: "J199-12",
          name: "The Homeric World",
          assessmentWindow: "Summer 2024",
        },
      ],
    ),
    buildSubject(
      "religious-studies",
      "Religious Studies",
      "AQA",
      "8062",
      [
        {
          code: "8062A",
          name: "Paper 1",
          assessmentWindow: "Summer 2024",
          status: "Completed",
          score: 71,
          maxScore: 96,
          grade: "8",
          reviewTopics: ["12-mark evaluation structure"],
        },
        {
          code: "8062B",
          name: "Paper 2",
          assessmentWindow: "Summer 2024",
        },
      ],
    ),
    buildSubject(
      "french",
      "French",
      "Pearson Edexcel",
      "1FR0",
      [
        {
          code: "1FR0-1F",
          name: "Listening",
          assessmentWindow: "Legacy Practice Set",
          status: "Completed",
          score: 41,
          maxScore: 50,
          grade: "7",
          reviewTopics: ["Recognising past tense verbs in audio"],
        },
        {
          code: "1FR0-2F",
          name: "Speaking",
          assessmentWindow: "Legacy Practice Set",
        },
        {
          code: "1FR0-3F",
          name: "Reading",
          assessmentWindow: "Legacy Practice Set",
        },
        {
          code: "1FR0-4F",
          name: "Writing",
          assessmentWindow: "Legacy Practice Set",
        },
      ],
      { route: "Legacy specification for practice" },
    ),
    buildSubject(
      "art-and-design",
      "Art and Design",
      "AQA",
      "8201",
      [
        {
          code: "8201-X",
          name: "Externally Set Assignment",
          assessmentWindow: "Summer 2026",
          reviewTopics: ["Refine annotation quality before final piece"],
          notes: "Track prep studies, artist references, and final outcome progress.",
        },
      ],
    ),
  ],
};
