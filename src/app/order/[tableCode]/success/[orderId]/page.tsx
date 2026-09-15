import { getOrderReceipt } from "@/features/orders/queries/get-order-receipt";
import { OrderSuccess, OrderUnavailable } from "@/ui/order/order-state";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order thành công" };

async function loadReceipt(tableCode: string, orderId: string) {
  try {
    return { receipt: await getOrderReceipt(tableCode, orderId), databaseError: false };
  } catch {
    return { receipt: null, databaseError: true };
  }
}

export default async function Page({ params }: { params: Promise<{ tableCode: string; orderId: string }> }) {
  const { tableCode, orderId } = await params;
  const { receipt, databaseError } = await loadReceipt(tableCode, orderId);
  return receipt ? <OrderSuccess receipt={receipt} /> : <OrderUnavailable database={databaseError} />;
}
