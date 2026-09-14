"use client";
import { useState, type FormEvent } from "react";
import { Modal } from "@/ui/core/modal";
import { Button } from "@/ui/core/primitives";
import { expenseCategories } from "@/data/expenses";
import type { Expense } from "@/types";
export function ExpenseFormModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const amount = Number(data.get("amount"));
    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      !text("description") ||
      !text("supplier")
    ) {
      setError("Enter a positive whole VND amount, supplier, and description.");
      return;
    }
    onAdd({
      id: crypto.randomUUID(),
      date: text("date"),
      category: text("category"),
      amount,
      supplier: text("supplier"),
      description: text("description"),
      payment: text("payment"),
      createdBy: "Minh Anh",
    });
    onClose();
  }
  return (
    <Modal title="Add Expense" onClose={onClose}>
      <form onSubmit={submit} className="expense-form">
        <p className="muted text-sm">
          Record a business expense. Entries stay in this preview session only.
        </p>
        <div className="form-grid">
          <label>
            Date
            <input type="date" name="date" defaultValue="2026-09-14" required />
          </label>
          <label>
            Category
            <select name="category">
              {expenseCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Amount (₫)
            <input
              type="number"
              name="amount"
              min="1"
              max="999999999999"
              step="1"
              placeholder="0"
              required
            />
          </label>
          <label>
            Payment Method
            <select name="payment">
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>QR Payment</option>
            </select>
          </label>
        </div>
        <label>
          Supplier
          <input
            name="supplier"
            placeholder="Supplier or payee name"
            maxLength={120}
            required
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            rows={3}
            placeholder="What was this expense for?"
            maxLength={300}
            required
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Expense</Button>
        </div>
      </form>
    </Modal>
  );
}
