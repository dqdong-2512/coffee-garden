import { ProfitScreen } from "@/ui/owner/profit/profit-screen";
import { getFinanceReport } from "@/features/finance/queries";
export const metadata = { title: "Profit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const { from, to } = await searchParams;
  return <ProfitScreen report={await getFinanceReport(from, to)} />;
}
