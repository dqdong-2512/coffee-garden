import assert from "node:assert/strict";
import test from "node:test";
import { updateProduct } from "../../src/features/management/services/management-service";
import { verifyPassword } from "../../src/lib/auth/password";
import { prisma } from "../../src/lib/db/prisma";

test("persists Owner menu changes and verifies the seeded login", async (context) => {
  const owner = await prisma.staffUser.findUniqueOrThrow({ where: { username: "owner" } });
  assert.equal(owner.role, "OWNER");
  assert.equal(
    await verifyPassword(process.env.SEED_OWNER_PASSWORD || "coffee-owner-local", owner.passwordHash),
    true,
  );

  const product = await prisma.product.findFirstOrThrow({
    where: { slug: "sinh-to-bo", branch: { code: "MAIN" } },
  });
  context.after(async () => {
    await prisma.product.update({
      where: { id: product.id },
      data: { price: product.price, isAvailable: product.isAvailable },
    });
    await prisma.$disconnect();
  });

  const changed = await updateProduct(product.id, {
    price: product.price + 1_000,
    isAvailable: !product.isAvailable,
  });
  assert.equal(changed.price, product.price + 1_000);
  assert.equal(changed.isAvailable, !product.isAvailable);

  const stored = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
  assert.equal(stored.price, product.price + 1_000);
  assert.equal(stored.isAvailable, !product.isAvailable);
});
