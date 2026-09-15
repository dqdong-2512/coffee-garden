"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, ScrollText, Sprout } from "lucide-react";
import type { IngredientRow, RecipeProduct } from "@/features/inventory/types";
import { currency } from "@/lib/utils";
import { Badge, Card, CardHeader, DataTable, PageHeader, StatCards } from "@/ui/core/primitives";
import { Modal } from "@/ui/core/modal";

const units = [{ value: "GRAM", label: "Gram (g)" }, { value: "MILLILITER", label: "Millilít (ml)" }, { value: "PIECE", label: "Cái" }];

export function InventoryScreen({ ingredients, recipes }: { ingredients: IngredientRow[]; recipes: RecipeProduct[] }) {
  const [editing, setEditing] = useState<IngredientRow | null | undefined>(undefined);
  const [recipe, setRecipe] = useState<RecipeProduct | undefined>();
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");

  async function saveIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    const response = await fetch(editing ? `/api/owner/ingredients/${editing.id}` : "/api/owner/ingredients", {
      method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.get("name"), lowStockThreshold: Number(data.get("lowStockThreshold")), costPerUnit: Number(data.get("costPerUnit")), isActive: data.get("isActive") === "on", ...(editing ? {} : { unit: data.get("unit") }) }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Không thể lưu nguyên liệu."); setBusy(false); return; }
    window.location.reload();
  }

  async function saveRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!recipe) return; setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    const items = ingredients.map((ingredient) => ({ ingredientId: ingredient.id, quantity: Number(data.get(`ingredient:${ingredient.id}`)) || 0 })).filter((item) => item.quantity > 0);
    const response = await fetch(`/api/owner/products/${recipe.id}/recipe`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Không thể lưu công thức."); setBusy(false); return; }
    window.location.reload();
  }

  const active = ingredients.filter((item) => item.isActive);
  return <>
    <PageHeader title="Nguyên liệu & công thức" description="Quản lý đơn vị cơ sở, giá vốn và định mức dùng cho từng món." action={<button className="button" onClick={() => { setError(""); setEditing(null); }}><Plus size={16} />Thêm nguyên liệu</button>} />
    <StatCards metrics={[
      { label: "Nguyên liệu đang dùng", value: String(active.length), note: `${ingredients.length} nguyên liệu`, tone: "green" },
      { label: "Tồn thấp", value: String(active.filter((item) => item.isLow).length), note: "Bằng hoặc dưới ngưỡng", tone: "gold" },
      { label: "Giá trị tồn ước tính", value: currency(active.reduce((sum, item) => sum + item.stockValue, 0)), note: "Theo giá vốn bình quân", tone: "brown" },
      { label: "Món có công thức", value: String(recipes.filter((item) => item.lines.length).length), note: `${recipes.length} món trong menu`, tone: "green" },
    ]} />
    <Card className="table-card management-table"><CardHeader title="Danh sách nguyên liệu" subtitle="Số lượng tồn dùng đơn vị g, ml hoặc cái" />
      <DataTable caption="Danh sách nguyên liệu" headers={["Nguyên liệu", "Tồn hiện tại", "Ngưỡng thấp", "Giá vốn/đơn vị", "Dùng trong", "Trạng thái", ""]}>
        {ingredients.map((item) => <tr key={item.id}>
          <td><div className="management-name"><span><Sprout size={17} /></span><div><strong>{item.name}</strong><small>{item.slug}</small></div></div></td>
          <td className="font-medium">{item.currentQuantity.toLocaleString("vi-VN")} {item.unitLabel}</td><td>{item.lowStockThreshold.toLocaleString("vi-VN")} {item.unitLabel}</td>
          <td>{currency(item.costPerUnit)}/{item.unitLabel}</td><td>{item.recipeCount} công thức</td><td><Badge>{!item.isActive ? "Ngừng dùng" : item.isLow ? "Tồn thấp" : "Đủ hàng"}</Badge></td>
          <td><button className="icon-action" aria-label={`Sửa ${item.name}`} onClick={() => { setError(""); setEditing(item); }}><Pencil size={15} /></button></td>
        </tr>)}
      </DataTable>
    </Card>
    <Card className="table-card management-table mt-6"><CardHeader title="Định mức món" subtitle="Giá vốn được tính từ số lượng định mức × giá vốn nguyên liệu" />
      <DataTable caption="Công thức món" headers={["Món", "Công thức", "Giá bán", "Giá vốn", "Biên gộp", ""]}>
        {recipes.map((item) => { const margin = item.price ? ((item.price - item.costAmount) / item.price) * 100 : 0; return <tr key={item.id}>
          <td><strong>{item.name}</strong></td><td className="expense-description">{item.lines.length ? item.lines.map((line) => `${line.ingredientName} ${line.quantity}${line.unitLabel}`).join(" · ") : "Chưa có định mức"}</td>
          <td>{currency(item.price)}</td><td className="font-medium">{currency(item.costAmount)}</td><td><Badge>{margin.toFixed(1)}%</Badge></td>
          <td><button className="icon-action" aria-label={`Sửa công thức ${item.name}`} onClick={() => { setError(""); setRecipe(item); }}><ScrollText size={15} /></button></td>
        </tr>; })}
      </DataTable>
    </Card>
    {editing !== undefined && <Modal title={editing ? "Sửa nguyên liệu" : "Thêm nguyên liệu"} onClose={() => setEditing(undefined)}><form className="management-form" onSubmit={saveIngredient}>
      <label>Tên nguyên liệu<input name="name" defaultValue={editing?.name} required maxLength={100} /></label>
      {!editing && <label>Đơn vị cơ sở<select name="unit" defaultValue="GRAM">{units.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</select></label>}
      <div className="form-grid"><label>Ngưỡng cảnh báo<input name="lowStockThreshold" type="number" min={0} step={1} defaultValue={editing?.lowStockThreshold ?? 0} required /></label><label>Giá vốn mỗi đơn vị (₫)<input name="costPerUnit" type="number" min={0} step={1} defaultValue={editing?.costPerUnit ?? 0} required /></label></div>
      <label className="management-check"><input name="isActive" type="checkbox" defaultChecked={editing?.isActive ?? true} />Đang sử dụng</label>
      {error && <p className="management-alert" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? "Đang lưu…" : "Lưu nguyên liệu"}</button>
    </form></Modal>}
    {recipe && <Modal title={`Định mức · ${recipe.name}`} onClose={() => setRecipe(undefined)}><form className="management-form recipe-form" onSubmit={saveRecipe}>
      <p className="muted text-sm">Nhập lượng nguyên liệu dùng cho một phần. Để 0 nếu món không dùng nguyên liệu đó.</p>
      <div className="recipe-fields">{ingredients.filter((item) => item.isActive).map((ingredient) => <label key={ingredient.id}>{ingredient.name} ({ingredient.unitLabel})<input name={`ingredient:${ingredient.id}`} type="number" min={0} step={1} defaultValue={recipe.lines.find((line) => line.ingredientId === ingredient.id)?.quantity ?? 0} /></label>)}</div>
      {error && <p className="management-alert" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? "Đang lưu…" : "Lưu định mức"}</button>
    </form></Modal>}
  </>;
}
