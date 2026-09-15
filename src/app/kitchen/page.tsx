import { listKitchenOrders } from "@/features/orders/queries/list-kitchen-orders";
import { requirePageUser } from "@/lib/auth/authorization";
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
  const user = await requirePageUser(["OWNER", "KITCHEN"], "/kitchen");
  const orders = await loadOrders();
  return (
    <KitchenBoard
      initialOrders={orders ?? []}
      databaseAvailable={orders !== null}
      user={user}
    />
  );
}
