"use client";

import { useState, type FormEvent } from "react";
import { ClipboardCheck, PackagePlus, Plus } from "lucide-react";
import type { IngredientRow, StockMovementRow } from "@/features/inventory/types";
import { currency } from "@/lib/utils";
import { Badge, Card, CardHeader, DataTable, PageHeader, StatCards } from "@/ui/core/primitives";
import { Modal } from "@/ui/core/modal";

export function StockScreen({ ingredients, movements }: { ingredients: IngredientRow[]; movements: StockMovementRow[] }) {
  const [open, setOpen] = useState(false); const [type, setType] = useState<"STOCK_IN" | "ADJUSTMENT">("STOCK_IN"); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    const body = type === "STOCK_IN"
      ? { type, ingredientId: data.get("ingredientId"), quantity: Number(data.get("quantity")), unitCost: Number(data.get("unitCost")), note: data.get("note") }
      : { type, ingredientId: data.get("ingredientId"), actualQuantity: Number(data.get("actualQuantity")), note: data.get("note") };
    const response = await fetch("/api/owner/stock-movements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Không thể cập nhật tồn kho."); setBusy(false); return; }
    window.location.reload();
  }
  return <>
    <PageHeader title="Tồn kho" description="Nhập hàng, kiểm kê và theo dõi các lần xuất kho tự động theo order." action={<button className="button" onClick={() => { setError(""); setOpen(true); }}><Plus size={16} />Cập nhật kho</button>} />
    <StatCards metrics={[
      { label: "Giá trị tồn", value: currency(ingredients.reduce((sum, item) => sum + item.stockValue, 0)), note: "Ước tính theo giá bình quân", tone: "green" },
      { label: "Tồn thấp", value: String(ingredients.filter((item) => item.isActive && item.isLow).length), note: "Cần kiểm tra hoặc nhập thêm", tone: "gold" },
      { label: "Hết hàng", value: String(ingredients.filter((item) => item.isActive && item.currentQuantity <= 0).length), note: "Có thể âm nếu kiểm kê thiếu", tone: "brown" },
      { label: "Biến động gần đây", value: String(movements.length), note: "Tối đa 200 dòng", tone: "green" },
    ]} />
    <Card className="table-card management-table"><CardHeader title="Nhật ký tồn kho" subtitle="Mọi lần nhập, điều chỉnh và xuất theo order đều được lưu" />
      <DataTable caption="Nhật ký tồn kho" headers={["Thời gian", "Nguyên liệu", "Loại", "Thay đổi", "Tồn sau", "Giá trị", "Người tạo / Order", "Ghi chú"]}>
        {movements.map((item) => <tr key={item.id}><td>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(item.createdAt))}</td><td className="font-medium">{item.ingredientName}</td><td><Badge>{item.type}</Badge></td>
          <td className={item.quantity < 0 ? "stock-negative" : "stock-positive"}>{item.quantity > 0 ? "+" : ""}{item.quantity.toLocaleString("vi-VN")} {item.unitLabel}</td><td>{item.balanceAfter.toLocaleString("vi-VN")} {item.unitLabel}</td><td>{item.totalCost ? currency(item.totalCost) : "—"}</td><td>{item.orderNo ?? item.createdBy}</td><td className="expense-description">{item.note}</td></tr>)}
      </DataTable>
    </Card>
    {open && <Modal title="Cập nhật tồn kho" onClose={() => setOpen(false)}><form className="management-form" onSubmit={save}>
      <div className="inventory-actions"><button type="button" className={type === "STOCK_IN" ? "active" : ""} onClick={() => setType("STOCK_IN")}><PackagePlus size={16} />Nhập kho</button><button type="button" className={type === "ADJUSTMENT" ? "active" : ""} onClick={() => setType("ADJUSTMENT")}><ClipboardCheck size={16} />Kiểm kê</button></div>
      <label>Nguyên liệu<select name="ingredientId" required>{ingredients.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.name} · tồn {item.currentQuantity.toLocaleString("vi-VN")} {item.unitLabel}</option>)}</select></label>
      {type === "STOCK_IN" ? <div className="form-grid"><label>Số lượng nhập<input name="quantity" type="number" min={1} step={1} required /></label><label>Giá mỗi đơn vị (₫)<input name="unitCost" type="number" min={1} step={1} required /></label></div> : <label>Số lượng thực tế sau kiểm kê<input name="actualQuantity" type="number" min={0} step={1} required /></label>}
      <label>Ghi chú<input name="note" maxLength={200} placeholder={type === "STOCK_IN" ? "Ví dụ: Nhập hàng ngày 15/09" : "Lý do chênh lệch kiểm kê"} required /></label>
      {error && <p className="management-alert" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? "Đang lưu…" : type === "STOCK_IN" ? "Ghi nhận nhập kho" : "Lưu kiểm kê"}</button>
    </form></Modal>}
  </>;
}
