import { listPaymentOrders } from "@/features/pos/queries";
import { requirePageUser } from "@/lib/auth/authorization";
import { PaymentsScreen } from "@/ui/owner/payments/payments-screen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payments" };
export default async function Page() {
  await requirePageUser(["OWNER"], "/owner/payments");
  return <PaymentsScreen initialOrders={await listPaymentOrders()} />;
}
