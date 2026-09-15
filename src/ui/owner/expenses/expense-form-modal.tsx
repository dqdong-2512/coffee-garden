"use client";

import { useState, type FormEvent } from "react";
import type { ExpenseRow } from "@/features/finance/types";
import { expenseCategories } from "@/features/finance/validation";
import { Modal } from "@/ui/core/modal";
import { Button } from "@/ui/core/primitives";

const labels: Record<(typeof expenseCategories)[number], string> = {
  INGREDIENT: "Nguyên liệu", SALARY: "Lương", ELECTRICITY: "Điện", WATER: "Nước", RENT: "Mặt bằng", MARKETING: "Marketing", EQUIPMENT: "Thiết bị", OTHER: "Khác",
};

export function ExpenseFormModal({ today, onClose, onAdd }: { today: string; onClose: () => void; onAdd: (expense: ExpenseRow) => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/owner/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      incurredAt: data.get("date"), category: data.get("category"), amount: Number(data.get("amount")), paymentMethod: data.get("paymentMethod"), supplier: data.get("supplier"), description: data.get("description"),
    }) });
    const result = (await response.json()) as { expense?: ExpenseRow; error?: string };
    if (!response.ok || !result.expense) { setError(result.error ?? "Không thể lưu chi phí."); setBusy(false); return; }
    onAdd(result.expense); onClose();
  }
  return <Modal title="Thêm chi phí" onClose={onClose}><form onSubmit={submit} className="expense-form">
    <p className="muted text-sm">Khoản chi sẽ được lưu vào PostgreSQL và cập nhật trong báo cáo.</p>
    <div className="form-grid">
      <label>Ngày chi<input type="date" name="date" defaultValue={today} required /></label>
      <label>Nhóm chi<select name="category">{expenseCategories.map((code) => <option key={code} value={code}>{labels[code]}</option>)}</select></label>
      <label>Số tiền (₫)<input type="number" name="amount" min="1" max="1000000000" step="1" placeholder="0" required /></label>
      <label>Thanh toán<select name="paymentMethod"><option value="CASH">Tiền mặt</option><option value="BANK_TRANSFER">Chuyển khoản</option></select></label>
    </div>
    <label>Nhà cung cấp<input name="supplier" placeholder="Tên nhà cung cấp hoặc người nhận" maxLength={120} required /></label>
    <label>Nội dung<textarea name="description" rows={3} placeholder="Khoản chi dùng cho việc gì?" maxLength={300} required /></label>
    {error && <p role="alert" className="management-alert">{error}</p>}
    <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={onClose}>Hủy</Button><Button type="submit" disabled={busy}>{busy ? "Đang lưu…" : "Lưu chi phí"}</Button></div>
  </form></Modal>;
}
