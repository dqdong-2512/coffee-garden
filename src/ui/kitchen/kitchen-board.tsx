"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  ChefHat,
  Clock3,
  Coffee,
  RefreshCw,
  RotateCcw,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import type { KitchenOrder, OrderStatus } from "@/features/orders/types";
import type { AuthenticatedUser } from "@/lib/auth/authorization";
import { LogoutButton } from "@/ui/auth/logout-button";
import { Modal } from "@/ui/core/modal";

const columns: Array<{
  key: "NEW" | "PREPARING" | "READY" | "SERVED";
  title: string;
  subtitle: string;
  icon: typeof Coffee;
}> = [
  { key: "NEW", title: "Mới", subtitle: "Chờ bắt đầu", icon: Bell },
  { key: "PREPARING", title: "Đang làm", subtitle: "Bếp đang chuẩn bị", icon: ChefHat },
  { key: "READY", title: "Sẵn sàng", subtitle: "Chờ phục vụ", icon: Check },
  { key: "SERVED", title: "Đã phục vụ", subtitle: "Hoàn tất gần đây", icon: Coffee },
];

function columnFor(status: OrderStatus) {
  return status === "PENDING" || status === "CONFIRMED" ? "NEW" : status;
}

function ageLabel(createdAt: string, now: number) {
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(createdAt).getTime()) / 60_000),
  );
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút`;
  return `${Math.floor(minutes / 60)}g ${minutes % 60}p`;
}

function nextAction(status: OrderStatus) {
  if (status === "PENDING" || status === "CONFIRMED") {
    return { status: "PREPARING" as const, label: "Bắt đầu làm", icon: ChefHat };
  }
  if (status === "PREPARING") {
    return { status: "READY" as const, label: "Đã sẵn sàng", icon: Check };
  }
  if (status === "READY") {
    return { status: "SERVED" as const, label: "Đã phục vụ", icon: Coffee };
  }
  return null;
}

export function KitchenBoard({
  initialOrders,
  databaseAvailable,
  user,
}: {
  initialOrders: KitchenOrder[];
  databaseAvailable: boolean;
  user: AuthenticatedUser;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [connected, setConnected] = useState(databaseAvailable);
  const [now, setNow] = useState(() => Date.now());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<KitchenOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const seenIds = useRef(new Set(initialOrders.map((order) => order.id)));
  const audioContext = useRef<AudioContext | null>(null);

  function beep() {
    const context = audioContext.current;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 760;
    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
  }

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/kitchen/orders", { cache: "no-store" });
      const body = (await response.json()) as { orders?: KitchenOrder[] };
      if (!response.ok || !body.orders) throw new Error();
      const incoming = body.orders.filter(
        (order) =>
          columnFor(order.status) === "NEW" && !seenIds.current.has(order.id),
      );
      body.orders.forEach((order) => seenIds.current.add(order.id));
      setOrders(body.orders);
      setConnected(true);
      setError("");
      if (incoming.length && soundEnabled) beep();
    } catch {
      setConnected(false);
      setError("Mất kết nối với server. Đang tự thử lại…");
    }
  }, [soundEnabled]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);
    const polling = window.setInterval(refresh, 4_000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(polling);
    };
  }, [refresh]);

  async function updateStatus(
    order: KitchenOrder,
    status: "PREPARING" | "READY" | "SERVED" | "CANCELLED",
    cancellationReason?: string,
  ) {
    setBusyId(order.id);
    setError("");
    try {
      const response = await fetch(`/api/kitchen/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cancellationReason }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Không thể cập nhật order.");
      }
      await refresh();
      setCancelOrder(null);
      setCancelReason("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Không thể cập nhật order.",
      );
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  const activeOrders = orders.filter(
    (order) => !["SERVED", "CANCELLED"].includes(order.status),
  );
  const itemCount = activeOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const time = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(now),
    [now],
  );

  return (
    <main className="kitchen-page">
      <header className="kitchen-header">
        <div className="kitchen-brand">
          <span><UtensilsCrossed size={21} /></span>
          <div><strong>Coffee Garden</strong><small>KITCHEN & BAR</small></div>
        </div>
        <div className="kitchen-summary">
          <span><b>{activeOrders.length}</b> order đang xử lý</span>
          <span><b>{itemCount}</b> món cần làm</span>
        </div>
        <div className="kitchen-tools">
          <span className="kitchen-user">{user.displayName}</span>
          <span className={connected ? "kitchen-connected" : "kitchen-disconnected"}>
            {connected ? "Đang kết nối" : "Mất kết nối"}
          </span>
          <button
            type="button"
            onClick={() => {
              if (!audioContext.current) audioContext.current = new AudioContext();
              setSoundEnabled((value) => !value);
            }}
          >
            {soundEnabled ? <Bell size={17} /> : <BellOff size={17} />}
            {soundEnabled ? "Âm báo bật" : "Bật âm báo"}
          </button>
          <button type="button" aria-label="Làm mới order" onClick={refresh}>
            <RefreshCw size={17} />
          </button>
          <strong className="kitchen-clock">{time}</strong>
          <LogoutButton compact />
        </div>
      </header>

      {error && <div className="kitchen-error" role="alert">{error}</div>}
      <section className="kitchen-board" aria-label="Danh sách order theo trạng thái">
        {columns.map((column) => {
          const columnOrders = orders
            .filter((order) => columnFor(order.status) === column.key)
            .filter(
              (order) =>
                column.key !== "SERVED" ||
                now - new Date(order.statusUpdatedAt).getTime() < 3 * 60 * 60 * 1000,
            );
          const Icon = column.icon;
          return (
            <section
              className={`kitchen-column kitchen-column-${column.key.toLowerCase()}`}
              key={column.key}
            >
              <header>
                <span><Icon size={18} /></span>
                <div><h2>{column.title}</h2><p>{column.subtitle}</p></div>
                <b>{columnOrders.length}</b>
              </header>
              <div className="kitchen-cards">
                {columnOrders.map((order) => {
                  const action = nextAction(order.status);
                  const ActionIcon = action?.icon;
                  return (
                    <article className="kitchen-ticket" key={order.id}>
                      <div className="kitchen-ticket-head">
                        <div><strong>{order.tableName}</strong><span>{order.orderNo}</span></div>
                        <span className="kitchen-age"><Clock3 size={13} />{ageLabel(order.createdAt, now)}</span>
                      </div>
                      <ul>
                        {order.items.map((item) => (
                          <li key={item.id}>
                            <b>{item.quantity}×</b>
                            <span>{item.productName}{item.itemNote && <small>{item.itemNote}</small>}</span>
                          </li>
                        ))}
                      </ul>
                      {order.customerNote && (
                        <p className="kitchen-note"><b>Ghi chú:</b> {order.customerNote}</p>
                      )}
                      {action && ActionIcon && (
                        <div className="kitchen-ticket-actions">
                          <button
                            type="button"
                            className="kitchen-cancel"
                            disabled={busyId === order.id}
                            onClick={() => setCancelOrder(order)}
                            aria-label={`Hủy ${order.orderNo}`}
                          ><XCircle size={17} /></button>
                          <button
                            type="button"
                            className="kitchen-next"
                            disabled={busyId === order.id}
                            onClick={() => updateStatus(order, action.status)}
                          >
                            {busyId === order.id ? (
                              <RotateCcw className="kitchen-spin" size={17} />
                            ) : (
                              <ActionIcon size={17} />
                            )}
                            {busyId === order.id ? "Đang lưu…" : action.label}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
                {!columnOrders.length && (
                  <div className="kitchen-empty"><Icon size={24} /><span>Chưa có order</span></div>
                )}
              </div>
            </section>
          );
        })}
      </section>

      {cancelOrder && (
        <Modal
          title={`Hủy ${cancelOrder.orderNo}`}
          onClose={() => {
            setCancelOrder(null);
            setCancelReason("");
          }}
        >
          <div className="kitchen-cancel-form">
            <p>Order của <strong>{cancelOrder.tableName}</strong> sẽ được thông báo là đã hủy cho khách.</p>
            <label>
              Lý do hủy
              <textarea
                autoFocus
                rows={3}
                maxLength={200}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Ví dụ: món đã hết, khách yêu cầu hủy…"
              />
            </label>
            <button
              type="button"
              disabled={!cancelReason.trim() || busyId === cancelOrder.id}
              onClick={() => updateStatus(cancelOrder, "CANCELLED", cancelReason)}
            ><XCircle size={17} />Xác nhận hủy order</button>
          </div>
        </Modal>
      )}
    </main>
  );
}
