import { RevenueScreen } from "@/ui/owner/revenue/revenue-screen";
import { getFinanceReport } from "@/features/finance/queries";
export const metadata = { title: "Revenue" };
export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from, to } = await searchParams;
  return <RevenueScreen report={await getFinanceReport(from, to)} />;
}
