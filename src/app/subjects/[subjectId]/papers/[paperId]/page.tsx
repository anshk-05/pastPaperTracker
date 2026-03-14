import { notFound } from "next/navigation";
import { PaperDetailView } from "@/components/tracker/paper-detail-view";
import { getPaperById } from "@/lib/db/storage";

type PaperPageProps = {
  params: Promise<{
    subjectId: string;
    paperId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PaperPage({ params }: PaperPageProps) {
  const { subjectId, paperId } = await params;
  const result = await getPaperById(subjectId, paperId);

  if (!result) {
    notFound();
  }

  return <PaperDetailView subject={result.subject} paper={result.paper} />;
}
