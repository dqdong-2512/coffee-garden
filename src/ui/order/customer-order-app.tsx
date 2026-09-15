"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CustomerCatalog } from "@/features/catalog/types";
import type { OrderReceipt } from "@/features/orders/types";
import { formatVnd } from "@/lib/utils";

type CartLine = { quantity: number; itemNote: string };
type Cart = Record<string, CartLine>;

const productEmoji: Record<string, string> = {
  "bun-bo-hue": "🍜",
  "bo-kho": "🥘",
  "banh-mi-chao": "🍳",
  "ca-phe-den-da": "🧊",
  "ca-phe-den-nong": "☕",
  "ca-phe-sua": "🥤",
  "bac-xiu": "🥛",
  "nuoc-cam": "🍊",
  "sinh-to-dau": "🍓",
  "sinh-to-bo": "🥑",
};

function requestIdFor(tableCode: string) {
  const key = `coffee-garden:order-request:${tableCode}`;
  const saved = window.sessionStorage.getItem(key);
  if (saved) return saved;
  const id = crypto.randomUUID();
  window.sessionStorage.setItem(key, id);
  return id;
}

export function CustomerOrderApp({ catalog }: { catalog: CustomerCatalog }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(catalog.categories[0]?.id ?? "");
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [customerNote, setCustomerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const cartProducts = useMemo(
    () =>
      catalog.products
        .filter((product) => cart[product.id]?.quantity)
        .map((product) => ({ ...product, ...cart[product.id] })),
    [cart, catalog.products],
  );
  const itemCount = cartProducts.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const visibleProducts = catalog.products.filter(
    (product) => product.categoryId === activeCategory,
  );

  function changeQuantity(productId: string, delta: number) {
    setCart((current) => {
      const line = current[productId] ?? { quantity: 0, itemNote: "" };
      const quantity = Math.max(0, Math.min(20, line.quantity + delta));
      if (!quantity) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: { ...line, quantity } };
    });
    setError("");
  }

  function changeItemNote(productId: string, itemNote: string) {
    setCart((current) => ({
      ...current,
      [productId]: { ...current[productId], itemNote },
    }));
  }

  async function submitOrder() {
    if (!cartProducts.length || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientRequestId: requestIdFor(catalog.table.code),
          tableCode: catalog.table.code,
          customerNote,
          items: cartProducts.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            itemNote: item.itemNote,
          })),
        }),
      });
      const body = (await response.json()) as {
        order?: OrderReceipt;
        error?: string;
      };
      if (!response.ok || !body.order) {
        throw new Error(body.error || "Không thể gửi order lúc này.");
      }
      window.sessionStorage.removeItem(
        `coffee-garden:order-request:${catalog.table.code}`,
      );
      router.push(`/order/${catalog.table.code}/success/${body.order.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể gửi order lúc này.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="customer-order-page">
      <header className="customer-hero">
        <div className="customer-topline">
          <span className="customer-brand-mark">CG</span>
          <div>
            <p className="customer-kicker">COFFEE GARDEN</p>
            <p className="customer-branch">{catalog.branch.name}</p>
          </div>
          <span className="customer-table-chip">{catalog.table.name}</span>
        </div>
        <h1>Hôm nay bạn dùng gì?</h1>
        <p>Chọn món, gửi bếp và thư thả tận hưởng khu vườn.</p>
      </header>

      <nav className="customer-category-tabs" aria-label="Danh mục món">
        {catalog.categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={category.id === activeCategory ? "active" : ""}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.slug === "food" ? "🍽️" : "☕"} {category.name}
          </button>
        ))}
      </nav>

      <section className="customer-menu" aria-live="polite">
        <div className="customer-section-title">
          <div>
            <p>THỰC ĐƠN</p>
            <h2>{catalog.categories.find((item) => item.id === activeCategory)?.name}</h2>
          </div>
          <span>{visibleProducts.length} món</span>
        </div>
        <div className="customer-product-grid">
          {visibleProducts.map((product) => {
            const quantity = cart[product.id]?.quantity ?? 0;
            return (
              <article className="customer-product-card" key={product.id}>
                <div className={`customer-product-art art-${product.categoryId === activeCategory ? catalog.categories.find((c) => c.id === product.categoryId)?.slug : "food"}`}>
                  <span aria-hidden="true">{productEmoji[product.slug] ?? "🍽️"}</span>
                  <span className="customer-art-leaf" />
                </div>
                <div className="customer-product-copy">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="customer-product-bottom">
                    <strong>{formatVnd(product.price)}</strong>
                    {quantity ? (
                      <div className="customer-stepper" aria-label={`Số lượng ${product.name}`}>
                        <button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label={`Bớt ${product.name}`}><Minus size={16} /></button>
                        <span>{quantity}</span>
                        <button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label={`Thêm ${product.name}`}><Plus size={16} /></button>
                      </div>
                    ) : (
                      <button className="customer-add" type="button" onClick={() => changeQuantity(product.id, 1)} aria-label={`Thêm ${product.name}`}>
                        <Plus size={19} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {itemCount > 0 && (
        <div className="customer-cart-dock">
          <button type="button" onClick={() => setCartOpen(true)}>
            <span className="customer-bag"><ShoppingBag size={20} /><b>{itemCount}</b></span>
            <span><small>Xem order</small><strong>{formatVnd(total)}</strong></span>
            <ChevronDown size={19} className="customer-dock-chevron" />
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="customer-sheet-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && setCartOpen(false)}>
          <section className="customer-sheet" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="customer-sheet-handle" />
            <header>
              <div><p>ORDER CỦA BẠN</p><h2 id="cart-title">{itemCount} món · {catalog.table.name}</h2></div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Đóng giỏ hàng"><X size={21} /></button>
            </header>
            <div className="customer-cart-lines">
              {cartProducts.map((item) => (
                <div className="customer-cart-line" key={item.id}>
                  <div className="customer-cart-line-main">
                    <span className="customer-cart-emoji" aria-hidden="true">{productEmoji[item.slug] ?? "🍽️"}</span>
                    <div><h3>{item.name}</h3><p>{formatVnd(item.price * item.quantity)}</p></div>
                    <div className="customer-stepper">
                      <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Bớt ${item.name}`}><Minus size={15} /></button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Thêm ${item.name}`}><Plus size={15} /></button>
                    </div>
                  </div>
                  <input maxLength={120} value={item.itemNote} onChange={(event) => changeItemNote(item.id, event.target.value)} aria-label={`Ghi chú cho ${item.name}`} placeholder="Ghi chú cho món (ít đá, không hành...)" />
                </div>
              ))}
            </div>
            <label className="customer-order-note">
              <span>Ghi chú chung</span>
              <textarea maxLength={300} rows={2} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} placeholder="Ví dụ: mang tất cả món cùng lúc" />
            </label>
            {error && <p className="customer-error" role="alert">{error}</p>}
            <div className="customer-total"><span>Tổng cộng</span><strong>{formatVnd(total)}</strong></div>
            <button className="customer-submit" type="button" disabled={submitting || !itemCount} onClick={submitOrder}>
              {submitting ? "Đang gửi order…" : <><Check size={19} /> Gửi order cho quán</>}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
