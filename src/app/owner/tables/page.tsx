import { listManagedTables } from "@/features/management/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { TablesScreen } from "@/ui/owner/management/tables-screen";
export const metadata = { title: "Tables" };
export default async function Page() {
  await requirePageUser(["OWNER"], "/owner/tables");
  return <TablesScreen initialTables={await listManagedTables()} />;
}
