"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  ChefHat,
  Coffee,
  CreditCard,
  Minus,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import type { AuthenticatedUser } from "@/lib/auth/authorization";
import type { PaymentOrder, PosCatalog } from "@/features/pos/types";
import type { OrderReceipt } from "@/features/orders/types";
import { formatVnd } from "@/lib/utils";
import { LogoutButton } from "@/ui/auth/logout-button";
import { Modal } from "@/ui/core/modal";

type Cart = Record<string, number>;
type Method = "LATER" | "CASH" | "BANK_TRANSFER";

export function PosApp({
  user,
  catalog,
  initialPaymentOrders,
}: {
  user: AuthenticatedUser;
  catalog: PosCatalog;
  initialPaymentOrders: PaymentOrder[];
}) {
  const [categoryId, setCategoryId] = useState(catalog.categories[0]?.id ?? "");
  const [tableCode, setTableCode] = useState(catalog.tables[0]?.code ?? "");
  const [cart, setCart] = useState<Cart>({});
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<Method>("LATER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<OrderReceipt | null>(null);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [paymentOrders, setPaymentOrders] = useState(initialPaymentOrders);
  const [paymentBusy, setPaymentBusy] = useState<string | null>(null);
  const requestId = useRef<string | null>(null);

  const cartLines = catalog.products
    .filter((product) => cart[product.id])
    .map((product) => ({ ...product, quantity: cart[product.id] ?? 0 }));
  const total = cartLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const quantity = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const visible = catalog.products.filter(
    (product) =>
      product.categoryId === categoryId &&
      product.name.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")),
  );
  const unpaid = useMemo(
    () => paymentOrders.filter((order) => order.status !== "CANCELLED" && order.payment?.status !== "PAID"),
    [paymentOrders],
  );

  function change(productId: string, delta: number) {
    requestId.current = null;
    setCart((current) => {
      const next = Math.max(0, Math.min(20, (current[productId] ?? 0) + delta));
      const copy = { ...current };
      if (next) copy[productId] = next;
      else delete copy[productId];
      return copy;
    });
    setError("");
  }

  async function submit() {
    if (!quantity || !tableCode || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientRequestId: requestId.current ?? (requestId.current = crypto.randomUUID()),
          tableCode,
          customerNote: note,
          items: cartLines.map((line) => ({ productId: line.id, quantity: line.quantity })),
          paymentMethod: method === "LATER" ? undefined : method,
        }),
      });
      const body = (await response.json()) as { order?: OrderReceipt; payment?: { id: string }; error?: string };
      if (!response.ok || !body.order) throw new Error(body.error ?? "Không thể tạo order.");
      setSuccess(body.order);
      setPaymentOrders((orders) => [{
        id: body.order!.id,
        orderNo: body.order!.orderNo,
        tableName: body.order!.tableName,
        source: "POS",
        status: body.order!.status,
        totalAmount: body.order!.totalAmount,
        createdAt: body.order!.createdAt,
        payment: body.payment ? {
          id: body.payment.id,
          method: method as "CASH" | "BANK_TRANSFER",
          status: "PAID",
          amount: body.order!.totalAmount,
          reference: null,
          note: null,
          receivedAt: new Date().toISOString(),
          voidReason: null,
          createdByName: user.displayName,
        } : null,
      }, ...orders]);
      setCart({});
      requestId.current = null;
      setNote("");
      setMethod("LATER");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tạo order.");
    } finally {
      setBusy(false);
    }
  }

  async function collect(order: PaymentOrder, paymentMethod: "CASH" | "BANK_TRANSFER") {
    setPaymentBusy(order.id);
    setError("");
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, method: paymentMethod }),
    });
    const body = (await response.json()) as { payment?: { id: string; receivedAt: string }; error?: string };
    if (response.ok && body.payment) {
      setPaymentOrders((orders) => orders.map((item) => item.id === order.id ? {
        ...item,
        payment: {
          id: body.payment!.id,
          method: paymentMethod,
          status: "PAID",
          amount: item.totalAmount,
          reference: null,
          note: null,
          receivedAt: body.payment!.receivedAt,
          voidReason: null,
          createdByName: user.displayName,
        },
      } : item));
    } else setError(body.error ?? "Không thể ghi nhận thanh toán.");
    setPaymentBusy(null);
  }

  return (
    <main className="pos-page">
      <header className="pos-header">
        <div className="pos-brand"><span><Coffee size={21} /></span><div><strong>{catalog.branch.name}</strong><small>STAFF POS</small></div></div>
        <div className="pos-header-actions">
          {user.role === "OWNER" && <Link href="/kitchen" className="pos-header-link"><ChefHat size={16} />Bếp</Link>}
          {user.role === "OWNER" && <Link href="/owner/payments" className="pos-header-link"><ReceiptText size={16} />Đối soát</Link>}
          <button className="pos-unpaid-button" onClick={() => setPaymentsOpen(true)}><CreditCard size={16} />Chờ thanh toán <b>{unpaid.length}</b></button>
          <span className="pos-user">{user.displayName}</span><LogoutButton compact />
        </div>
      </header>

      <section className="pos-layout">
        <div className="pos-catalog">
          <div className="pos-catalog-head">
            <div><p>MENU HÔM NAY</p><h1>Chọn món cho khách</h1></div>
            <label className="pos-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm món…" /></label>
          </div>
          <nav className="pos-categories" aria-label="Danh mục POS">
            {catalog.categories.map((category) => <button key={category.id} aria-pressed={categoryId === category.id} onClick={() => setCategoryId(category.id)}>{category.name}</button>)}
          </nav>
          <div className="pos-products">
            {visible.map((product) => <button className="pos-product" key={product.id} onClick={() => change(product.id, 1)}>
              <span>{product.slug.includes("ca-phe") ? "☕" : product.slug.includes("sinh-to") ? "🥤" : "🍽️"}</span>
              <strong>{product.name}</strong><small>{product.description}</small><b>{formatVnd(product.price)}</b>
              <i><Plus size={16} /></i>
            </button>)}
          </div>
        </div>

        <aside className="pos-cart">
          <div className="pos-cart-head"><div><p>ORDER HIỆN TẠI</p><h2>{quantity ? `${quantity} món` : "Chưa chọn món"}</h2></div><ShoppingCart size={21} /></div>
          <label>Bàn phục vụ<select value={tableCode} onChange={(event) => { requestId.current = null; setTableCode(event.target.value); }}>{catalog.tables.map((table) => <option key={table.id} value={table.code}>{table.name} · {table.code}</option>)}</select></label>
          <div className="pos-cart-lines">
            {cartLines.map((line) => <div className="pos-cart-line" key={line.id}>
              <div><strong>{line.name}</strong><small>{formatVnd(line.price)} × {line.quantity}</small></div>
              <b>{formatVnd(line.price * line.quantity)}</b>
              <div className="pos-stepper"><button onClick={() => change(line.id, -1)}>{line.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}</button><span>{line.quantity}</span><button onClick={() => change(line.id, 1)}><Plus size={14} /></button></div>
            </div>)}
            {!cartLines.length && <div className="pos-cart-empty"><ShoppingCart size={30} /><span>Chạm vào món để thêm vào order</span></div>}
          </div>
          <label>Ghi chú<textarea rows={2} maxLength={300} value={note} onChange={(event) => { requestId.current = null; setNote(event.target.value); }} placeholder="Ít cay, mang nước trước…" /></label>
          <fieldset className="pos-payment-method"><legend>Thanh toán</legend>
            {(["LATER", "CASH", "BANK_TRANSFER"] as Method[]).map((value) => <label key={value}><input type="radio" checked={method === value} onChange={() => setMethod(value)} />{value === "LATER" ? "Thanh toán sau" : value === "CASH" ? "Tiền mặt" : "Chuyển khoản"}</label>)}
          </fieldset>
          {error && <p className="pos-error" role="alert">{error}</p>}
          <div className="pos-total"><span>Tổng cộng</span><strong>{formatVnd(total)}</strong></div>
          <button className="pos-submit" disabled={!quantity || busy} onClick={submit}><CheckCircle2 size={18} />{busy ? "Đang tạo order…" : "Tạo order"}</button>
        </aside>
      </section>

      {success && <div className="pos-toast" role="status"><CheckCircle2 size={19} /><span><b>{success.orderNo}</b> đã gửi đến bếp · {success.tableName}</span><button onClick={() => setSuccess(null)}>×</button></div>}
      {paymentsOpen && <Modal title={`Chờ thanh toán · ${unpaid.length}`} onClose={() => setPaymentsOpen(false)}>
        <div className="pos-payment-list">
          {unpaid.map((order) => <article key={order.id}><div><strong>{order.orderNo}</strong><span>{order.tableName} · {formatVnd(order.totalAmount)}</span></div><div><button disabled={paymentBusy === order.id} onClick={() => collect(order, "CASH")}><Banknote size={15} />Tiền mặt</button><button disabled={paymentBusy === order.id} onClick={() => collect(order, "BANK_TRANSFER")}><CreditCard size={15} />Chuyển khoản</button></div></article>)}
          {!unpaid.length && <p className="pos-payment-empty"><CheckCircle2 size={28} />Không còn order chờ thanh toán.</p>}
          {error && <p className="pos-error" role="alert">{error}</p>}
        </div>
      </Modal>}
    </main>
  );
}
