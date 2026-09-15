import assert from "node:assert/strict";
import test from "node:test";
import { createStaffOrder } from "../../src/features/orders/services/create-customer-order";
import { OrderServiceError } from "../../src/features/orders/services/order-errors";
import { updateOrderStatus } from "../../src/features/orders/services/update-order-status";
import {
  PaymentError,
  recordPayment,
  voidPayment,
} from "../../src/features/payments/services/payment-service";
import { prisma } from "../../src/lib/db/prisma";

test("persists a POS order and derives its payment amount on the server", async (context) => {
  const cashier = await prisma.staffUser.findUniqueOrThrow({ where: { username: "cashier" } });
  const product = await prisma.product.findFirstOrThrow({
    where: { slug: "ca-phe-sua", branch: { code: "MAIN" } },
  });
  const result = await createStaffOrder({
    clientRequestId: crypto.randomUUID(),
    tableCode: "T09",
    items: [{ productId: product.id, quantity: 2 }],
    customerNote: "POS integration test",
  });
  context.after(async () => {
    await prisma.payment.deleteMany({ where: { orderId: result.order.id } });
    await prisma.order.delete({ where: { id: result.order.id } });
    await prisma.$disconnect();
  });

  const first = await recordPayment(
    { orderId: result.order.id, method: "CASH", amount: 1 },
    cashier.id,
  );
  assert.equal(first.payment.amount, result.order.totalAmount);
  assert.equal(first.payment.amount, product.price * 2);
  assert.equal(first.payment.method, "CASH");

  await assert.rejects(
    () => updateOrderStatus(result.order.id, { status: "CANCELLED", cancellationReason: "test" }),
    (error) =>
      error instanceof OrderServiceError &&
      error.code === "PAID_ORDER_CANNOT_BE_CANCELLED",
  );

  await assert.rejects(
    () => recordPayment({ orderId: result.order.id, method: "BANK_TRANSFER" }, cashier.id),
    (error) => error instanceof PaymentError && error.code === "PAYMENT_ALREADY_RECORDED",
  );

  await voidPayment(first.payment.id, { reason: "Integration test reversal" });
  const replacement = await recordPayment(
    { orderId: result.order.id, method: "BANK_TRANSFER", reference: "TEST-001" },
    cashier.id,
  );
  assert.equal(replacement.payment.status, "PAID");
  assert.equal(replacement.payment.method, "BANK_TRANSFER");
  assert.equal(replacement.payment.reference, "TEST-001");
});
