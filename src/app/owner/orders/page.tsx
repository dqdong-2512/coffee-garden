import { listOwnerOrders } from "@/features/orders/queries/list-owner-orders";
import { OrdersScreen } from "@/ui/owner/orders/orders-screen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

async function loadOrders() {
  try {
    return await listOwnerOrders();
  } catch {
    return null;
  }
}

export default async function Page() {
  const orders = await loadOrders();
  if (orders) return <OrdersScreen orders={orders} />;
  return (
    <div className="card placeholder-card">
      <h2>Database is not running</h2>
      <p>Start PostgreSQL, run the checked-in migration and seed data, then reload this page.</p>
    </div>
  );
}
