import type { PrintableOrder } from "@/features/printing/types";
import { PrintToolbar } from "./print-toolbar";

function time(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export function KitchenTicketDocument({ order, autoPrint }: { order: PrintableOrder; autoPrint?: boolean }) {
  return <main className="print-page">
    <PrintToolbar autoPrint={autoPrint} />
    <article className="print-paper kitchen-print-paper">
      <header><p>PHIẾU BẾP / BAR</p><h1>{order.tableName}</h1><strong>{order.orderNo}</strong><span>{time(order.createdAt)} · {order.source === "POS" ? "POS" : "QR BÀN"}</span></header>
      <ol>{order.items.map((item) => <li key={item.id}>
        <b>{item.quantity}×</b><div><strong>{item.productName}</strong>{item.itemNote && <small>{item.itemNote}</small>}</div>
      </li>)}</ol>
      {order.customerNote && <div className="kitchen-print-note"><b>GHI CHÚ CHUNG</b><p>{order.customerNote}</p></div>}
      <footer>{order.shop.name} · In lúc {time(new Date().toISOString())}</footer>
    </article>
  </main>;
}
