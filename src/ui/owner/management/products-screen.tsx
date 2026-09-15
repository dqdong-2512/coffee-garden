"use client";

import { useState, type FormEvent } from "react";
import { Coffee, Pencil, Plus, Power } from "lucide-react";
import type { ManagedCategory, ManagedProduct } from "@/features/management/types";
import { currency } from "@/lib/utils";
import { Badge, Card, DataTable, PageHeader } from "@/ui/core/primitives";
import { Modal } from "@/ui/core/modal";

type ProductResponse = { product?: Omit<ManagedProduct, "categoryName">; error?: string };

export function ProductsScreen({
  initialProducts,
  categories,
}: {
  initialProducts: ManagedProduct[];
  categories: ManagedCategory[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<ManagedProduct | null | undefined>(undefined);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyId(editing?.id ?? "new");
    setError("");
    const data = new FormData(event.currentTarget);
    const body = {
      name: data.get("name"),
      categoryId: data.get("categoryId"),
      description: data.get("description"),
      price: Number(data.get("price")),
      displayOrder: Number(data.get("displayOrder")),
      isAvailable: data.get("isAvailable") === "on",
    };
    const response = await fetch(
      editing ? `/api/owner/products/${editing.id}` : "/api/owner/products",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const result = (await response.json()) as ProductResponse;
    if (!response.ok || !result.product) {
      setError(result.error ?? "Không thể lưu món.");
      setBusyId(null);
      return;
    }
    const categoryName = categories.find((item) => item.id === result.product?.categoryId)?.name ?? "—";
    const saved = { ...result.product, categoryName };
    setProducts((items) =>
      editing ? items.map((item) => (item.id === saved.id ? saved : item)) : [...items, saved],
    );
    setEditing(undefined);
    setBusyId(null);
  }

  async function toggle(product: ManagedProduct) {
    setBusyId(product.id);
    setError("");
    const response = await fetch(`/api/owner/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !product.isAvailable }),
    });
    const result = (await response.json()) as ProductResponse;
    if (response.ok && result.product) {
      setProducts((items) =>
        items.map((item) => item.id === product.id ? { ...item, isAvailable: result.product!.isAvailable } : item),
      );
    } else {
      setError(result.error ?? "Không thể đổi trạng thái món.");
    }
    setBusyId(null);
  }

  return (
    <>
      <PageHeader
        title="Món trong menu"
        description={`${products.length} món · thay đổi hiển thị ngay trên menu QR của khách.`}
        action={<button className="button" onClick={() => setEditing(null)}><Plus size={16} />Thêm món</button>}
      />
      {error && <p className="management-alert" role="alert">{error}</p>}
      <Card className="table-card management-table">
        <DataTable caption="Danh sách món" headers={["Món", "Danh mục", "Giá", "Thứ tự", "Trạng thái", "Thao tác"]}>
          {products.map((product) => (
            <tr key={product.id}>
              <td><div className="management-name"><span><Coffee size={17} /></span><div><strong>{product.name}</strong><small>{product.description || "Chưa có mô tả"}</small></div></div></td>
              <td>{product.categoryName}</td>
              <td className="font-medium">{currency(product.price)}</td>
              <td>{product.displayOrder}</td>
              <td><Badge>{product.isAvailable ? "Đang bán" : "Tạm hết"}</Badge></td>
              <td><div className="management-actions">
                <button aria-label={`Sửa ${product.name}`} onClick={() => setEditing(product)}><Pencil size={15} /></button>
                <button disabled={busyId === product.id} aria-label={`Đổi trạng thái ${product.name}`} onClick={() => toggle(product)}><Power size={15} /></button>
              </div></td>
            </tr>
          ))}
        </DataTable>
      </Card>
      {editing !== undefined && (
        <Modal title={editing ? "Sửa món" : "Thêm món mới"} onClose={() => setEditing(undefined)}>
          <form className="management-form" onSubmit={save}>
            <div className="form-grid">
              <label>Tên món<input name="name" defaultValue={editing?.name} required maxLength={80} /></label>
              <label>Danh mục<select name="categoryId" defaultValue={editing?.categoryId} required>
                <option value="" disabled>Chọn danh mục</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}{item.isActive ? "" : " (đang ẩn)"}</option>)}
              </select></label>
            </div>
            <label>Mô tả<textarea name="description" rows={3} maxLength={300} defaultValue={editing?.description} /></label>
            <div className="form-grid">
              <label>Giá bán (₫)<input name="price" type="number" min={1000} step={1000} defaultValue={editing?.price ?? 30000} required /></label>
              <label>Thứ tự hiển thị<input name="displayOrder" type="number" min={0} max={999} defaultValue={editing?.displayOrder ?? products.length + 1} required /></label>
            </div>
            <label className="management-check"><input name="isAvailable" type="checkbox" defaultChecked={editing?.isAvailable ?? true} />Đang bán trên menu QR</label>
            {error && <p className="management-alert" role="alert">{error}</p>}
            <button className="button" type="submit" disabled={busyId !== null}>{busyId ? "Đang lưu…" : "Lưu món"}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
