import { listIngredients, listRecipes } from "@/features/inventory/queries";
import { InventoryScreen } from "@/ui/owner/inventory/inventory-screen";
export const metadata = { title: "Ingredients" };
export default async function Page() {
  const [ingredients, recipes] = await Promise.all([listIngredients(), listRecipes()]);
  return <InventoryScreen ingredients={ingredients} recipes={recipes} />;
}
