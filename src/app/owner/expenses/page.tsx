import { ExpensesScreen } from "@/ui/owner/expenses/expenses-screen";
import { listExpenses } from "@/features/finance/queries";
import { vietnamDate } from "@/features/finance/period";
export const metadata = { title: "Expenses" };
export default async function Page() {
  return <ExpensesScreen initialExpenses={await listExpenses()} today={vietnamDate()} />;
}
