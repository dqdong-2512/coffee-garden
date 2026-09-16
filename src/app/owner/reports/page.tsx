import { getDailyCloseData } from "@/features/closing/queries";
import { DailyClosingScreen } from "@/ui/owner/closing/daily-closing-screen";
export const metadata = { title: "Daily Closing" };
export default async function Page({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  return <DailyClosingScreen data={await getDailyCloseData(date)} />;
}
