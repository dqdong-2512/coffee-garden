import { DashboardScreen } from "@/ui/owner/dashboard/dashboard-screen";
import { getFinanceReport } from "@/features/finance/queries";
import { vietnamDate } from "@/features/finance/period";
import { requirePageUser } from "@/lib/auth/authorization";
import { getShopSettings } from "@/features/settings/queries";
export const metadata = { title: "Dashboard" };
export default async function Page() {
  const user = await requirePageUser(["AUDIT"], "/owner/dashboard");
  const today = vietnamDate();
  const [todayReport, monthReport, shop] = await Promise.all([getFinanceReport(today, today), getFinanceReport(), getShopSettings()]);
  return <DashboardScreen today={todayReport} month={monthReport} userName={user.displayName} shopName={shop.name} />;
}
