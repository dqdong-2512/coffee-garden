import { Fragment } from "react";
import { Clock3, RefreshCw } from "lucide-react";
import { listOwnerOrders } from "@/features/orders/queries/list-owner-orders";
import { formatVnd } from "@/lib/utils";
import { Badge, Card, CardHeader, DataTable, PageHeader } from "@/ui/core/primitives";

type Orders = Awaited<ReturnType<typeof listOwnerOrders>>;

const statusLabel = {
  PENDING: "New",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  CANCELLED: "Cancelled",
} as const;

export function OrdersScreen({ orders }: { orders: Orders }) {
  const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  return (
    <>
      <PageHeader title="Orders" description="Customer orders saved in PostgreSQL, newest first." action={<span className="date-chip"><RefreshCw size={15} /> Refresh page for new orders</span>} />
      <div className="section-eyebrow"><span>LIVE ORDER DATA</span><span className="flex items-center gap-2"><span className="status-dot" /> Main Branch</span></div>
      <Card className="table-card">
        <CardHeader title="Recent Orders" subtitle="Latest 100 orders across QR ordering and POS" action={<Badge>{orders.length} orders</Badge>} />
        <DataTable caption="Recent customer orders" headers={["Order", "Time", "Table", "Source", "Items", "Status", "Total"]}>
          {orders.map((order) => {
            const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <Fragment key={order.id}>
              <tr>
                <td className="font-semibold">{order.orderNo}</td>
                <td><span className="owner-order-time"><Clock3 size={13} />{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(order.createdAt)}</span></td>
                <td>{order.table.code}</td>
                <td>{order.source === "CUSTOMER_QR" ? "Table QR" : "POS"}</td>
                <td>{quantity}</td>
                <td><Badge>{statusLabel[order.status]}</Badge></td>
                <td className="font-semibold">{formatVnd(order.totalAmount)}</td>
              </tr>
              <tr className="owner-order-detail-row">
                <td colSpan={7}>
                  <details className="owner-order-details">
                    <summary>View order details</summary>
                    <div>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={`${item.productName}-${index}`}>
                            <span><b>{item.quantity}×</b> {item.productName}{item.itemNote && <small>{item.itemNote}</small>}</span>
                            <strong>{formatVnd(item.lineTotal)}</strong>
                          </li>
                        ))}
                      </ul>
                      {order.customerNote && <p><b>Customer note:</b> {order.customerNote}</p>}
                      {order.cancellationReason && <p><b>Cancellation:</b> {order.cancellationReason}</p>}
                    </div>
                  </details>
                </td>
              </tr>
              </Fragment>
            );
          })}
          {!orders.length && <tr><td colSpan={7} className="empty-table">No orders yet. Submit one from /order/T12.</td></tr>}
        </DataTable>
        <div className="table-footer"><span>{orders.length} orders</span><span>Recorded value <strong className="ml-3 text-stone-800">{formatVnd(total)}</strong></span></div>
      </Card>
      <p className="mock-note">Authenticated database data · order values use the price snapshots stored at checkout.</p>
    </>
  );
}
