"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import type { ExpenseRow } from "@/features/finance/types";
import { currency } from "@/lib/utils";
import { Card, CardHeader, PageHeader, StatCards, Button, DataTable, Badge } from "@/ui/core/primitives";
import { ExpenseFormModal } from "./expense-form-modal";

const categoryNames = ["Nguyên liệu", "Lương", "Điện", "Nước", "Mặt bằng", "Marketing", "Thiết bị", "Khác"];

export function ExpensesScreen({ initialExpenses, today }: { initialExpenses: ExpenseRow[]; today: string }) {
  const [rows, setRows] = useState(initialExpenses);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Tất cả nhóm");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const month = rows.filter((expense) => expense.date.startsWith(today.slice(0, 7)));
  const total = (items: ExpenseRow[]) => items.reduce((sum, expense) => sum + expense.amount, 0);
  const filtered = rows.filter((expense) =>
    (category === "Tất cả nhóm" || expense.category === category) &&
    `${expense.description} ${expense.supplier}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  ).sort((a, b) => b.date.localeCompare(a.date));

  return <>
    <PageHeader title="Quản lý chi phí" description="Ghi nhận các khoản chi của quán để theo dõi dòng tiền và lợi nhuận ước tính."
      action={<Button onClick={() => setOpen(true)}><Plus size={17} />Thêm chi phí</Button>} />
    <StatCards metrics={[
      { label: "Chi hôm nay", value: currency(total(rows.filter((expense) => expense.date === today))), note: today.split("-").reverse().join("/"), tone: "brown" },
      { label: "Chi tháng này", value: currency(total(month)), note: `Tháng ${today.slice(5, 7)}/${today.slice(0, 4)}`, tone: "gold" },
      { label: "Mua nguyên liệu", value: currency(total(month.filter((expense) => expense.categoryCode === "INGREDIENT"))), note: "Tháng này · theo ngày thanh toán", tone: "green" },
      { label: "Chi vận hành khác", value: currency(total(month.filter((expense) => expense.categoryCode !== "INGREDIENT"))), note: "Tháng này · không gồm nguyên liệu", tone: "brown" },
    ]} />
    {notice && <p className="management-alert" role="status">{notice}</p>}
    <Card className="table-card">
      <CardHeader title="Tất cả chi phí" subtitle="Dữ liệu được lưu trong PostgreSQL" action={<Badge>{rows.length} khoản</Badge>} />
      <div className="expense-filters">
        <label className="search-field"><Search size={16} /><input aria-label="Tìm chi phí" placeholder="Tìm nội dung hoặc nhà cung cấp…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <select aria-label="Lọc nhóm chi phí" value={category} onChange={(event) => setCategory(event.target.value)}><option>Tất cả nhóm</option>{categoryNames.map((name) => <option key={name}>{name}</option>)}</select>
      </div>
      <DataTable caption="Danh sách chi phí" headers={["Ngày", "Nhóm", "Nội dung", "Nhà cung cấp", "Số tiền", "Thanh toán", "Người tạo"]}>
        {filtered.map((expense) => <tr key={expense.id}>
          <td>{expense.date.split("-").reverse().join("/")}</td><td><Badge>{expense.category}</Badge></td><td className="expense-description">{expense.description}</td><td>{expense.supplier}</td>
          <td className="font-semibold">{currency(expense.amount)}</td><td>{expense.payment}</td><td>{expense.createdBy}</td>
        </tr>)}
        {!filtered.length && <tr><td colSpan={7} className="empty-table">Không có khoản chi phù hợp.</td></tr>}
      </DataTable>
      <div className="table-footer"><span>{filtered.length} khoản chi</span><span>Tổng <strong className="ml-3 text-stone-800">{currency(total(filtered))}</strong></span></div>
    </Card>
    {open && <ExpenseFormModal today={today} onClose={() => setOpen(false)} onAdd={(expense) => { setRows((current) => [expense, ...current]); setNotice(`Đã lưu ${expense.description} — ${currency(expense.amount)}.`); }} />}
  </>;
}
