import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { loadDatabase } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const database = await loadDatabase();

  return <DashboardOverview database={database} />;
}
