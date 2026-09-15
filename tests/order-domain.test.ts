import assert from "node:assert/strict";
import test from "node:test";
import { calculateOrderTotals } from "../src/features/orders/services/order-calculations";
import { customerOrderSchema } from "../src/features/orders/validation/customer-order";
import { kitchenStatusSchema } from "../src/features/orders/validation/kitchen-status";

const firstProduct = "11111111-1111-4111-8111-111111111111";
const secondProduct = "22222222-2222-4222-8222-222222222222";

test("normalizes a valid customer order", () => {
  const result = customerOrderSchema.parse({
    clientRequestId: crypto.randomUUID(),
    tableCode: " t12 ",
    customerNote: "  Mang cùng lúc  ",
    items: [{ productId: firstProduct, quantity: 1, itemNote: "  không hành  " }],
  });
  assert.equal(result.tableCode, "T12");
  assert.equal(result.customerNote, "Mang cùng lúc");
  assert.equal(result.items[0]?.itemNote, "không hành");
});

test("rejects duplicate products and more than 50 portions", () => {
  const result = customerOrderSchema.safeParse({
    clientRequestId: crypto.randomUUID(),
    tableCode: "T12",
    items: [
      { productId: firstProduct, quantity: 20 },
      { productId: firstProduct, quantity: 20 },
      { productId: secondProduct, quantity: 11 },
    ],
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(
      result.error.issues.map((issue) => issue.message),
      ["Mỗi món chỉ được xuất hiện một lần.", "Mỗi lượt đặt tối đa 50 phần."],
    );
  }
});

test("calculates line totals and order total using integer VND", () => {
  const result = calculateOrderTotals([
    { productId: firstProduct, productName: "Bún bò Huế", unitPrice: 55_000, quantity: 1 },
    { productId: secondProduct, productName: "Cà phê sữa", unitPrice: 30_000, quantity: 2 },
  ]);
  assert.equal(result.lines[0]?.lineTotal, 55_000);
  assert.equal(result.lines[1]?.lineTotal, 60_000);
  assert.equal(result.totalAmount, 115_000);
});

test("requires a reason when the kitchen cancels an order", () => {
  assert.equal(kitchenStatusSchema.safeParse({ status: "PREPARING" }).success, true);
  const cancelled = kitchenStatusSchema.safeParse({ status: "CANCELLED" });
  assert.equal(cancelled.success, false);
  if (!cancelled.success) {
    assert.equal(cancelled.error.issues[0]?.message, "Vui lòng nhập lý do hủy order.");
  }
});
