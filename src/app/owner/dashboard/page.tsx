import { DashboardScreen } from "@/ui/owner/dashboard/dashboard-screen";
import { getFinanceReport } from "@/features/finance/queries";
import { vietnamDate } from "@/features/finance/period";
import { requirePageUser } from "@/lib/auth/authorization";
export const metadata = { title: "Dashboard" };
export default async function Page() {
  const user = await requirePageUser(["OWNER"], "/owner/dashboard");
  const today = vietnamDate();
  const [todayReport, monthReport] = await Promise.all([getFinanceReport(today, today), getFinanceReport()]);
  return <DashboardScreen today={todayReport} month={monthReport} userName={user.displayName} />;
}
