import { requirePageUser } from "@/lib/auth/authorization";
import { getPosCatalog, listPaymentOrders } from "@/features/pos/queries";
import { PosApp } from "@/ui/pos/pos-app";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff POS" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ table?: string | string[] }>;
}) {
  const user = await requirePageUser(["ORDER"], "/pos");
  const [catalog, paymentOrders] = await Promise.all([getPosCatalog(), listPaymentOrders(30)]);
  if (!catalog) return <main className="pos-state">Không thể tải dữ liệu quán.</main>;
  const requestedTable = (await searchParams).table;
  const tableCode = Array.isArray(requestedTable) ? requestedTable[0] : requestedTable;
  const initialTableCode = catalog.tables.some((table) => table.code === tableCode)
    ? tableCode
    : catalog.tables[0]?.code;
  return (
    <PosApp
      user={user}
      catalog={catalog}
      initialPaymentOrders={paymentOrders}
      initialTableCode={initialTableCode}
    />
  );
}
