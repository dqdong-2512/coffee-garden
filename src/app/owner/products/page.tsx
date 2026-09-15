import { listManagedCategories, listManagedProducts } from "@/features/management/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { ProductsScreen } from "@/ui/owner/management/products-screen";
export const metadata = { title: "Products" };
export default async function Page() {
  await requirePageUser(["OWNER"], "/owner/products");
  const [products, categories] = await Promise.all([listManagedProducts(), listManagedCategories()]);
  return <ProductsScreen initialProducts={products} categories={categories} />;
}
