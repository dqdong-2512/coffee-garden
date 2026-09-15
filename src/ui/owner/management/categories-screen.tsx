"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Tags } from "lucide-react";
import type { ManagedCategory } from "@/features/management/types";
import { Badge, Card, DataTable, PageHeader } from "@/ui/core/primitives";
import { Modal } from "@/ui/core/modal";

type CategoryResponse = { category?: Omit<ManagedCategory, "productCount">; error?: string };

export function CategoriesScreen({ initialCategories }: { initialCategories: ManagedCategory[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<ManagedCategory | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch(
      editing ? `/api/owner/categories/${editing.id}` : "/api/owner/categories",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          displayOrder: Number(data.get("displayOrder")),
          ...(editing ? { isActive: data.get("isActive") === "on" } : {}),
        }),
      },
    );
    const result = (await response.json()) as CategoryResponse;
    if (!response.ok || !result.category) {
      setError(result.error ?? "Không thể lưu danh mục.");
      setBusy(false);
      return;
    }
    const saved = { ...result.category, productCount: editing?.productCount ?? 0 };
    setCategories((items) => editing ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved]);
    setEditing(undefined);
    setBusy(false);
  }

  return (
    <>
      <PageHeader
        title="Danh mục menu"
        description="Sắp xếp nhóm món và kiểm soát nhóm nào xuất hiện trên menu khách."
        action={<button className="button" onClick={() => setEditing(null)}><Plus size={16} />Thêm danh mục</button>}
      />
      {error && <p className="management-alert" role="alert">{error}</p>}
      <Card className="table-card management-table">
        <DataTable caption="Danh sách danh mục" headers={["Danh mục", "Slug", "Số món", "Thứ tự", "Trạng thái", ""]}>
          {categories.map((category) => (
            <tr key={category.id}>
              <td><div className="management-name"><span><Tags size={17} /></span><strong>{category.name}</strong></div></td>
              <td>{category.slug}</td><td>{category.productCount}</td><td>{category.displayOrder}</td>
              <td><Badge>{category.isActive ? "Đang hiển thị" : "Đang ẩn"}</Badge></td>
              <td><div className="management-actions"><button aria-label={`Sửa ${category.name}`} onClick={() => setEditing(category)}><Pencil size={15} /></button></div></td>
            </tr>
          ))}
        </DataTable>
      </Card>
      {editing !== undefined && (
        <Modal title={editing ? "Sửa danh mục" : "Thêm danh mục"} onClose={() => setEditing(undefined)}>
          <form className="management-form" onSubmit={save}>
            <label>Tên danh mục<input name="name" defaultValue={editing?.name} required maxLength={80} /></label>
            <label>Thứ tự hiển thị<input name="displayOrder" type="number" min={0} max={999} defaultValue={editing?.displayOrder ?? categories.length + 1} required /></label>
            {editing && <label className="management-check"><input name="isActive" type="checkbox" defaultChecked={editing.isActive} />Hiển thị danh mục trên menu QR</label>}
            {error && <p className="management-alert" role="alert">{error}</p>}
            <button className="button" type="submit" disabled={busy}>{busy ? "Đang lưu…" : "Lưu danh mục"}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
