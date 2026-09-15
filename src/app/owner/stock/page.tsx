import { listIngredients, listStockMovements } from "@/features/inventory/queries";
import { StockScreen } from "@/ui/owner/inventory/stock-screen";
export const metadata = { title: "Stock" };
export default async function Page() {
  const [ingredients, movements] = await Promise.all([listIngredients(), listStockMovements()]);
  return <StockScreen ingredients={ingredients} movements={movements} />;
}
