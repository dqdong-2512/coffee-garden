import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { safeNextPath } from "../src/features/auth/validation/login";
import {
  createProductSchema,
  createTableSchema,
} from "../src/features/management/validation";
import { paymentSchema } from "../src/features/payments/validation";
import { createExpenseSchema } from "../src/features/finance/validation";
import { financePeriod } from "../src/features/finance/period";
import { stockMovementSchema } from "../src/features/inventory/validation";

test("hashes staff passwords with a unique salt and verifies them", async () => {
  const first = await hashPassword("coffee-owner-local");
  const second = await hashPassword("coffee-owner-local");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("coffee-owner-local", first), true);
  assert.equal(await verifyPassword("wrong-password", first), false);
});

test("signs and rejects tampered staff session tokens", async () => {
  process.env.AUTH_SESSION_SECRET = "test-session-secret-with-more-than-32-characters";
  const { createSessionToken, verifySessionToken } = await import(
    "../src/lib/auth/session"
  );
  const token = createSessionToken({
    id: "11111111-1111-4111-8111-111111111111",
    role: "OWNER",
  });
  assert.equal(verifySessionToken(token)?.role, "OWNER");
  assert.equal(verifySessionToken(`${token}tampered`), null);
});

test("only accepts local redirect paths after login", () => {
  assert.equal(safeNextPath("/owner/products", "/owner/dashboard"), "/owner/products");
  assert.equal(safeNextPath("//evil.example", "/owner/dashboard"), "/owner/dashboard");
  assert.equal(safeNextPath("https://evil.example", "/kitchen"), "/kitchen");
});

test("normalizes table codes and validates menu prices", () => {
  const table = createTableSchema.parse({ code: " t13 ", name: "Bàn 13" });
  assert.equal(table.code, "T13");
  assert.equal(
    createProductSchema.safeParse({
      categoryId: "11111111-1111-4111-8111-111111111111",
      name: "Trà đào",
      price: 500,
    }).success,
    false,
  );
});

test("accepts supported payment methods and ignores a client amount", () => {
  const payment = paymentSchema.parse({
    orderId: "11111111-1111-4111-8111-111111111111",
    method: "CASH",
    amount: 1,
  });
  assert.equal(payment.method, "CASH");
  assert.equal("amount" in payment, false);
  assert.equal(
    paymentSchema.safeParse({ orderId: payment.orderId, method: "CARD" }).success,
    false,
  );
});

test("validates expense inputs and normalizes reversed report dates", () => {
  const expense = createExpenseSchema.parse({
    category: "INGREDIENT", amount: "125000", incurredAt: "2026-09-15",
    supplier: "Chợ địa phương", description: "Rau và gia vị", paymentMethod: "CASH",
  });
  assert.equal(expense.amount, 125000);
  assert.equal(createExpenseSchema.safeParse({ ...expense, incurredAt: "2026-02-31" }).success, false);
  assert.deepEqual(financePeriod("2026-09-15", "2026-09-01"), {
    from: "2026-09-01", to: "2026-09-15", label: "01/09/2026 – 15/09/2026",
  });
  assert.equal(financePeriod("2026-02-31", "2026-09-15").from, "2026-09-01");
});

test("requires a positive unit cost for stock receipts", () => {
  const ingredientId = "11111111-1111-4111-8111-111111111111";
  assert.equal(stockMovementSchema.safeParse({ type: "STOCK_IN", ingredientId, quantity: 1000, unitCost: 180, note: "Nhập cà phê" }).success, true);
  assert.equal(stockMovementSchema.safeParse({ type: "STOCK_IN", ingredientId, quantity: 1000, unitCost: 0, note: "Nhập cà phê" }).success, false);
});
