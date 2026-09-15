import { listKitchenOrders } from "@/features/orders/queries/list-kitchen-orders";
import { KitchenBoard } from "@/ui/kitchen/kitchen-board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kitchen & Bar" };

async function loadOrders() {
  try {
    return await listKitchenOrders();
  } catch {
    return null;
  }
}

export default async function Page() {
  const orders = await loadOrders();
  return <KitchenBoard initialOrders={orders ?? []} databaseAvailable={orders !== null} />;
}
