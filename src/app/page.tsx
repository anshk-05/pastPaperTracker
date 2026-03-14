import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { seedDatabase } from "@/lib/db/seed";

export default function HomePage() {
  return <DashboardOverview database={seedDatabase} />;
}
