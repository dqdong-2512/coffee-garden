"use client";

import { useState, type FormEvent } from "react";
import { Banknote, CreditCard, Printer, RotateCcw, WalletCards } from "lucide-react";
import type { PaymentOrder } from "@/features/pos/types";
import { formatVnd } from "@/lib/utils";
import { Badge, Card, DataTable, PageHeader } from "@/ui/core/primitives";
import { Modal } from "@/ui/core/modal";

export function PaymentsScreen({ initialOrders }: { initialOrders: PaymentOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [collecting, setCollecting] = useState<PaymentOrder | null>(null);
  const [voiding, setVoiding] = useState<PaymentOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const paid = orders.filter((order) => order.payment?.status === "PAID");
  const collected = paid.reduce((sum, order) => sum + (order.payment?.amount ?? 0), 0);
  const pending = orders.filter((order) => order.status !== "CANCELLED" && order.payment?.status !== "PAID");

  async function collect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!collecting) return;
    setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const method = String(data.get("method")) as "CASH" | "BANK_TRANSFER";
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: collecting.id, method, reference: data.get("reference"), note: data.get("note") }),
    });
    const body = (await response.json()) as { payment?: { id: string; receivedAt: string }; error?: string };
    if (response.ok && body.payment) {
      setOrders((items) => items.map((item) => item.id === collecting.id ? { ...item, payment: {
        id: body.payment!.id, method, status: "PAID", amount: item.totalAmount,
        reference: String(data.get("reference") || "") || null,
        note: String(data.get("note") || "") || null,
        receivedAt: body.payment!.receivedAt, voidReason: null, createdByName: "Chủ quán",
      }} : item));
      setCollecting(null);
    } else setError(body.error ?? "Không thể ghi nhận thanh toán.");
    setBusy(false);
  }

  async function voidCurrent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!voiding?.payment) return;
    setBusy(true); setError("");
    const reason = String(new FormData(event.currentTarget).get("reason"));
    const response = await fetch(`/api/payments/${voiding.payment.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }),
    });
    const body = (await response.json()) as { error?: string };
    if (response.ok) {
      setOrders((items) => items.map((item) => item.id === voiding.id && item.payment ? { ...item, payment: { ...item.payment, status: "VOIDED", voidReason: reason } } : item));
      setVoiding(null);
    } else setError(body.error ?? "Không thể hủy thanh toán.");
    setBusy(false);
  }

  return <>
    <PageHeader title="Thanh toán" description="Ghi nhận và đối soát tiền mặt, chuyển khoản theo từng order." />
    <div className="payment-stats">
      <Card><span><WalletCards size={18} /></span><p>Đã thu</p><strong>{formatVnd(collected)}</strong><small>{paid.length} giao dịch gần nhất</small></Card>
      <Card><span><CreditCard size={18} /></span><p>Chờ thanh toán</p><strong>{pending.length}</strong><small>Order chưa ghi nhận tiền</small></Card>
      <Card><span><Banknote size={18} /></span><p>Tiền mặt</p><strong>{formatVnd(paid.filter((o) => o.payment?.method === "CASH").reduce((s, o) => s + o.totalAmount, 0))}</strong><small>Trong 100 order gần nhất</small></Card>
    </div>
    {error && <p className="management-alert" role="alert">{error}</p>}
    <Card className="table-card payment-table">
      <DataTable caption="Đối soát thanh toán" headers={["Order", "Bàn", "Nguồn", "Số tiền", "Phương thức", "Thanh toán", "Thao tác"]}>
        {orders.map((order) => <tr key={order.id}>
          <td><strong>{order.orderNo}</strong><small>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(order.createdAt))}</small></td>
          <td>{order.tableName}</td><td>{order.source === "POS" ? "POS" : "QR bàn"}</td><td className="font-semibold">{formatVnd(order.totalAmount)}</td>
          <td>{order.payment?.method === "CASH" ? "Tiền mặt" : order.payment?.method === "BANK_TRANSFER" ? "Chuyển khoản" : "—"}</td>
          <td><Badge>{order.payment?.status === "PAID" ? "Đã thu" : order.payment?.status === "VOIDED" ? "Đã hủy thu" : order.status === "CANCELLED" ? "Order đã hủy" : "Chưa thu"}</Badge>{order.payment?.status === "PAID" && <small>{order.payment.createdByName}</small>}</td>
          <td><div className="payment-actions"><a className="payment-action" href={`/print/receipt/${order.id}`} target="_blank" rel="noreferrer"><Printer size={14} />In</a>{order.payment?.status === "PAID" ? <button className="payment-action secondary" onClick={() => setVoiding(order)}><RotateCcw size={14} />Hủy thu</button> : order.status !== "CANCELLED" ? <button className="payment-action" onClick={() => setCollecting(order)}><CreditCard size={14} />Thu tiền</button> : null}</div></td>
        </tr>)}
      </DataTable>
    </Card>
    <p className="mock-note">Số tiền thanh toán luôn lấy từ tổng order trên server. Hủy thu yêu cầu lý do và giữ lại lịch sử trên bản ghi.</p>

    {collecting && <Modal title={`Thu tiền ${collecting.orderNo}`} onClose={() => setCollecting(null)}><form className="management-form" onSubmit={collect}>
      <div className="payment-amount"><span>Số tiền cần thu</span><strong>{formatVnd(collecting.totalAmount)}</strong></div>
      <label>Phương thức<select name="method"><option value="CASH">Tiền mặt</option><option value="BANK_TRANSFER">Chuyển khoản</option></select></label>
      <label>Mã tham chiếu (nếu có)<input name="reference" maxLength={100} placeholder="Mã giao dịch ngân hàng" /></label>
      <label>Ghi chú<textarea name="note" rows={2} maxLength={200} /></label>
      {error && <p className="management-alert">{error}</p>}<button className="button" disabled={busy}>{busy ? "Đang lưu…" : "Xác nhận đã thu"}</button>
    </form></Modal>}
    {voiding && <Modal title={`Hủy thu ${voiding.orderNo}`} onClose={() => setVoiding(null)}><form className="management-form" onSubmit={voidCurrent}>
      <p className="muted">Giao dịch {formatVnd(voiding.totalAmount)} sẽ chuyển sang trạng thái đã hủy thu.</p>
      <label>Lý do<input name="reason" minLength={3} maxLength={200} required placeholder="Ví dụ: khách chuyển khoản nhầm" /></label>
      {error && <p className="management-alert">{error}</p>}<button className="button payment-void-submit" disabled={busy}>{busy ? "Đang lưu…" : "Xác nhận hủy thu"}</button>
    </form></Modal>}
  </>;
}
