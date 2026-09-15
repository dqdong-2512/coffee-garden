import { requirePageUser } from "@/lib/auth/authorization";
import { getPosCatalog, listPaymentOrders } from "@/features/pos/queries";
import { PosApp } from "@/ui/pos/pos-app";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff POS" };

export default async function Page() {
  const user = await requirePageUser(["OWNER", "CASHIER"], "/pos");
  const [catalog, paymentOrders] = await Promise.all([getPosCatalog(), listPaymentOrders(30)]);
  if (!catalog) return <main className="pos-state">Không thể tải dữ liệu quán.</main>;
  return <PosApp user={user} catalog={catalog} initialPaymentOrders={paymentOrders} />;
}
