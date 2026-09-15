import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../../src/lib/db/prisma";
import { createCustomerOrder } from "../../src/features/orders/services/create-customer-order";

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
  context.after(async () => {
    await prisma.order.delete({ where: { id: first.order.id } });
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
});
