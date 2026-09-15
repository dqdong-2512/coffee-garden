"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, ChefHat, Coffee, XCircle } from "lucide-react";
import Link from "next/link";
import type { OrderReceipt, OrderStatus } from "@/features/orders/types";
import { formatVnd } from "@/lib/utils";

const progressSteps: Array<{ status: OrderStatus; label: string }> = [
  { status: "PENDING", label: "Đã nhận" },
  { status: "PREPARING", label: "Đang làm" },
  { status: "READY", label: "Sẵn sàng" },
  { status: "SERVED", label: "Đã phục vụ" },
];

const statusCopy: Record<OrderStatus, { title: string; description: string }> = {
  PENDING: { title: "Quán đã nhận order", description: "Order đang chờ bếp bắt đầu chuẩn bị." },
  CONFIRMED: { title: "Quán đã xác nhận", description: "Order sắp được bếp chuẩn bị." },
  PREPARING: { title: "Bếp đang chuẩn bị", description: "Món của bạn đang được làm." },
  READY: { title: "Món đã sẵn sàng", description: "Nhân viên sẽ mang món ra bàn ngay." },
  SERVED: { title: "Chúc bạn ngon miệng!", description: "Order đã được phục vụ đầy đủ." },
  CANCELLED: { title: "Order đã được hủy", description: "Vui lòng gọi nhân viên nếu bạn cần hỗ trợ." },
};

function progressIndex(status: OrderStatus) {
  if (status === "CONFIRMED") return 0;
  return progressSteps.findIndex((step) => step.status === status);
}

export function OrderProgress({ initialReceipt }: { initialReceipt: OrderReceipt }) {
  const [receipt, setReceipt] = useState(initialReceipt);
  const [connected, setConnected] = useState(true);
  const copy = statusCopy[receipt.status];
  const currentIndex = progressIndex(receipt.status);
  const terminal = receipt.status === "SERVED" || receipt.status === "CANCELLED";

  useEffect(() => {
    if (terminal) return;
    const polling = window.setInterval(async () => {
      try {
        const response = await fetch(
          `/api/orders/${receipt.id}?tableCode=${encodeURIComponent(receipt.tableCode)}`,
          { cache: "no-store" },
        );
        const body = (await response.json()) as { order?: OrderReceipt };
        if (!response.ok || !body.order) throw new Error();
        setReceipt(body.order);
        setConnected(true);
      } catch {
        setConnected(false);
      }
    }, 4_000);
    return () => window.clearInterval(polling);
  }, [receipt.id, receipt.tableCode, terminal]);

  const StatusIcon =
    receipt.status === "CANCELLED"
      ? XCircle
      : receipt.status === "PREPARING"
        ? ChefHat
        : receipt.status === "SERVED"
          ? Coffee
          : CheckCircle2;

  return (
    <section className={`customer-success-card customer-status-${receipt.status.toLowerCase()}`}>
      <span className="customer-success-icon"><StatusIcon size={36} /></span>
      <p className="customer-kicker">THEO DÕI ORDER</p>
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      {!connected && <p className="customer-progress-offline">Mất kết nối · đang tự thử lại</p>}

      {receipt.status !== "CANCELLED" && (
        <ol className="customer-progress" aria-label="Tiến độ order">
          {progressSteps.map((step, index) => (
            <li key={step.status} className={index <= currentIndex ? "complete" : ""} aria-current={index === currentIndex ? "step" : undefined}>
              <span>{index < currentIndex ? <Check size={14} /> : index + 1}</span>
              <small>{step.label}</small>
            </li>
          ))}
        </ol>
      )}

      {receipt.status === "CANCELLED" && (
        <div className="customer-cancel-message">
          <strong>Lý do</strong>
          <span>{receipt.cancellationReason}</span>
        </div>
      )}

      <div className="customer-order-number">
        <small>MÃ ORDER</small>
        <strong>{receipt.orderNo}</strong>
        <span>{receipt.tableName} · {new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(receipt.createdAt))}</span>
      </div>
      <div className="customer-receipt-lines">
        {receipt.items.map((item, index) => (
          <div key={`${item.productName}-${index}`}>
            <span><b>{item.quantity}×</b> {item.productName}{item.itemNote && <small>{item.itemNote}</small>}</span>
            <strong>{formatVnd(item.lineTotal)}</strong>
          </div>
        ))}
      </div>
      <div className="customer-receipt-total"><span>Tổng cộng</span><strong>{formatVnd(receipt.totalAmount)}</strong></div>
      <Link className="customer-new-order" href={`/order/${receipt.tableCode}`}><Coffee size={18} /> Gọi thêm món</Link>
    </section>
  );
}
