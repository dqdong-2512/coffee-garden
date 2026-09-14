"use client";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { expenses, expenseCategories } from "@/data/expenses";
import { currency } from "@/lib/utils";
import {
  Card,
  CardHeader,
  PageHeader,
  StatCards,
  Button,
  DataTable,
  Badge,
} from "@/ui/core/primitives";
import { ExpenseFormModal } from "./expense-form-modal";
export function ExpensesScreen() {
  const [rows, setRows] = useState(expenses);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("All categories");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const month = rows.filter((e) => e.date.startsWith("2026-09"));
  const total = (items: typeof rows) =>
    items.reduce((sum, e) => sum + e.amount, 0);
  const filtered = rows
    .filter(
      (e) =>
        (category === "All categories" || e.category === category) &&
        `${e.description} ${e.supplier}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader
        title="Expense Management"
        description="Stay on top of your costs. Make every đồng count."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={17} />
            Add Expense
          </Button>
        }
      />
      <StatCards
        metrics={[
          {
            label: "Today Expenses",
            value: currency(total(rows.filter((e) => e.date === "2026-09-14"))),
            note: "14 September 2026",
            tone: "brown",
          },
          {
            label: "This Month",
            value: currency(total(month)),
            note: "September 2026",
            tone: "gold",
          },
          {
            label: "Ingredient Cost",
            value: currency(
              total(month.filter((e) => e.category === "Ingredient")),
            ),
            note: "This month · purchases",
            tone: "green",
          },
          {
            label: "Operating Cost",
            value: currency(
              total(month.filter((e) => e.category !== "Ingredient")),
            ),
            note: "This month · non-ingredient",
            tone: "brown",
          },
        ]}
      />
      <Card className="table-card">
        <CardHeader
          title="All Expenses"
          subtitle="Your spending, organized in one place"
          action={<Badge>{rows.length} entries</Badge>}
        />
        <div className="expense-filters">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search expenses"
              placeholder="Search description or supplier…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter expense category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All categories</option>
            {expenseCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <DataTable
          caption="Expense entries"
          headers={[
            "Date",
            "Category",
            "Description",
            "Supplier",
            "Amount",
            "Payment Method",
            "Created By",
          ]}
        >
          {filtered.map((e) => (
            <tr key={e.id}>
              <td>{e.date.split("-").reverse().join("/")}</td>
              <td>
                <Badge>{e.category}</Badge>
              </td>
              <td className="expense-description">{e.description}</td>
              <td>{e.supplier}</td>
              <td className="font-semibold">{currency(e.amount)}</td>
              <td>{e.payment}</td>
              <td>{e.createdBy}</td>
            </tr>
          ))}
          {!filtered.length && (
            <tr>
              <td colSpan={7} className="empty-table">
                No expenses match your filters.
              </td>
            </tr>
          )}
        </DataTable>
        <div className="table-footer">
          <span>{filtered.length} expenses</span>
          <span>
            Total{" "}
            <strong className="ml-3 text-stone-800">
              {currency(total(filtered))}
            </strong>
          </span>
        </div>
      </Card>
      <p className="mock-note" role="status">
        {notice ||
          "Mock data · Added expenses are kept until this page is reloaded or you navigate away."}
      </p>
      {open && (
        <ExpenseFormModal
          onClose={() => setOpen(false)}
          onAdd={(e) => {
            setRows([e, ...rows]);
            setNotice(
              `Added ${e.description} — ${currency(e.amount)}. This entry is temporary.`,
            );
          }}
        />
      )}
    </>
  );
}
