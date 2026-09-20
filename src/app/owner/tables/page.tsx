import { listManagedTables } from "@/features/management/queries";
import { getShopSettings } from "@/features/settings/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { TablesScreen } from "@/ui/owner/management/tables-screen";
export const metadata = { title: "Tables" };
export default async function Page() {
  await requirePageUser(["AUDIT"], "/owner/tables");
  const [tables, shop] = await Promise.all([listManagedTables(), getShopSettings()]);
  return <TablesScreen initialTables={tables} shopName={shop.name} />;
}
