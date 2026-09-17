import { formatVnd } from "@/lib/utils";
import type { PrintableOrder } from "@/features/printing/types";
import { PrintToolbar } from "./print-toolbar";

const paymentLabels = { CASH: "Tiền mặt", BANK_TRANSFER: "Chuyển khoản" } as const;

function dateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export function ReceiptDocument({ order, autoPrint }: { order: PrintableOrder; autoPrint?: boolean }) {
  const paid = order.payment?.status === "PAID";
  return <main className="print-page">
    <PrintToolbar autoPrint={autoPrint} />
    <article className="print-paper receipt-paper">
      <header className="print-shop-head">
        <h1>{order.shop.name}</h1>
        {order.shop.address && <p>{order.shop.address}</p>}
        {order.shop.phone && <p>ĐT: {order.shop.phone}</p>}
        {order.shop.taxCode && <p>MST: {order.shop.taxCode}</p>}
        <h2>HÓA ĐƠN BÁN HÀNG</h2>
      </header>
      <dl className="print-meta">
        <div><dt>Mã order</dt><dd>{order.orderNo}</dd></div>
        <div><dt>Bàn</dt><dd>{order.tableName} · {order.tableCode}</dd></div>
        <div><dt>Thời gian</dt><dd>{dateTime(order.createdAt)}</dd></div>
        <div><dt>Nguồn</dt><dd>{order.source === "POS" ? "Tại quầy" : "QR tại bàn"}</dd></div>
      </dl>
      <table className="print-items">
        <thead><tr><th>Món</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
        <tbody>{order.items.map((item) => <tr key={item.id}>
          <td>{item.productName}{item.itemNote && <small>{item.itemNote}</small>}</td>
          <td>{item.quantity}</td><td>{formatVnd(item.unitPrice)}</td><td>{formatVnd(item.lineTotal)}</td>
        </tr>)}</tbody>
      </table>
      {order.customerNote && <p className="print-order-note"><b>Ghi chú:</b> {order.customerNote}</p>}
      <div className="print-total"><span>TỔNG CỘNG</span><strong>{formatVnd(order.totalAmount)}</strong></div>
      <div className={`print-payment-state ${paid ? "paid" : "pending"}`}>
        <strong>{paid ? "ĐÃ THANH TOÁN" : order.payment?.status === "VOIDED" ? "THANH TOÁN ĐÃ HỦY" : "CHƯA THANH TOÁN"}</strong>
        {paid && order.payment && <>
          <span>{paymentLabels[order.payment.method]} · {dateTime(order.payment.receivedAt)}</span>
          <span>Thu bởi {order.payment.createdByName}{order.payment.reference ? ` · ${order.payment.reference}` : ""}</span>
        </>}
      </div>
      <footer><p>{order.shop.receiptFooter || "Cảm ơn quý khách và hẹn gặp lại!"}</p><small>Phiếu được in từ {order.shop.name} · {dateTime(new Date().toISOString())}</small></footer>
    </article>
  </main>;
}
