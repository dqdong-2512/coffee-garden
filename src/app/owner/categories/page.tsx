import { listManagedCategories } from "@/features/management/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { CategoriesScreen } from "@/ui/owner/management/categories-screen";
export const metadata = { title: "Categories" };
export default async function Page() {
  await requirePageUser(["AUDIT"], "/owner/categories");
  return <CategoriesScreen initialCategories={await listManagedCategories()} />;
}
