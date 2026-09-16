import { listKitchenOrders } from "@/features/orders/queries/list-kitchen-orders";
import { getShopSettings } from "@/features/settings/queries";
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
  const [orders, shop] = await Promise.all([loadOrders(), getShopSettings()]);
  return (
    <KitchenBoard
      initialOrders={orders ?? []}
      databaseAvailable={orders !== null}
      user={user}
      shopName={shop.name}
    />
  );
}
