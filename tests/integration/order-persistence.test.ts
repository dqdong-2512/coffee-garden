import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../../src/lib/db/prisma";
import { createCustomerOrder } from "../../src/features/orders/services/create-customer-order";
import { updateOrderStatus } from "../../src/features/orders/services/update-order-status";
import { OrderServiceError } from "../../src/features/orders/services/order-errors";

test("persists an order atomically and replays the same request", async (context) => {
  const table = await prisma.diningTable.findFirstOrThrow({
    where: { code: "T12", isActive: true },
  });
  const products = await prisma.product.findMany({
    where: { branchId: table.branchId, slug: { in: ["bun-bo-hue", "ca-phe-sua"] } },
  });
  const bunBo = products.find((product) => product.slug === "bun-bo-hue");
  const cafeSua = products.find((product) => product.slug === "ca-phe-sua");
  assert.ok(bunBo);
  assert.ok(cafeSua);

  const input = {
    clientRequestId: crypto.randomUUID(),
    tableCode: "T12",
    customerNote: "integration test",
    items: [
      { productId: bunBo.id, quantity: 1 },
      { productId: cafeSua.id, quantity: 2 },
    ],
  };
  const first = await createCustomerOrder(input);
  const createdIds = [first.order.id];
  context.after(async () => {
    await prisma.order.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  assert.equal(first.replayed, false);
  assert.equal(first.order.totalAmount, 115_000);
  const replay = await createCustomerOrder(input);
  assert.equal(replay.replayed, true);
  assert.equal(replay.order.id, first.order.id);

  const stored = await prisma.order.findUniqueOrThrow({
    where: { id: first.order.id },
    include: { items: true },
  });
  assert.equal(stored.totalAmount, 115_000);
  assert.equal(stored.items.length, 2);

  await assert.rejects(
    () => updateOrderStatus(first.order.id, { status: "READY" }),
    (error) =>
      error instanceof OrderServiceError &&
      error.code === "INVALID_STATUS_TRANSITION",
  );
  assert.equal(
    (await updateOrderStatus(first.order.id, { status: "PREPARING" })).status,
    "PREPARING",
  );
  assert.equal(
    (await updateOrderStatus(first.order.id, { status: "READY" })).status,
    "READY",
  );
  assert.equal(
    (await updateOrderStatus(first.order.id, { status: "SERVED" })).status,
    "SERVED",
  );
  const served = await prisma.order.findUniqueOrThrow({
    where: { id: first.order.id },
  });
  assert.ok(served.servedAt);

  const cancellation = await createCustomerOrder({
    ...input,
    clientRequestId: crypto.randomUUID(),
  });
  createdIds.push(cancellation.order.id);
  await updateOrderStatus(cancellation.order.id, {
    status: "CANCELLED",
    cancellationReason: "Khách yêu cầu hủy",
  });
  const cancelled = await prisma.order.findUniqueOrThrow({
    where: { id: cancellation.order.id },
  });
  assert.equal(cancelled.status, "CANCELLED");
  assert.equal(cancelled.cancellationReason, "Khách yêu cầu hủy");
  assert.ok(cancelled.cancelledAt);
});
