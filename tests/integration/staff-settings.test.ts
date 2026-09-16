import assert from "node:assert/strict";
import test from "node:test";
import {
  createStaff,
  resetStaffPassword,
  SettingsError,
  updateShopSettings,
  updateStaff,
} from "../../src/features/settings/settings-service";
import { verifyPassword } from "../../src/lib/auth/password";
import { prisma } from "../../src/lib/db/prisma";

test("manages staff safely and persists single-shop settings", async (context) => {
  const owner = await prisma.staffUser.findUniqueOrThrow({ where: { username: "owner" } });
  const username = "step9-review-user";
  await prisma.staffUser.deleteMany({ where: { username } });
  const originalShop = await prisma.branch.findUniqueOrThrow({ where: { code: "MAIN" } });

  context.after(async () => {
    await prisma.staffUser.deleteMany({ where: { username } });
    await prisma.branch.update({
      where: { id: originalShop.id },
      data: {
        name: originalShop.name,
        address: originalShop.address,
        phone: originalShop.phone,
        taxCode: originalShop.taxCode,
        receiptFooter: originalShop.receiptFooter,
      },
    });
    await prisma.$disconnect();
  });

  const created = await createStaff({
    username,
    displayName: "Nhân viên Step 9",
    role: "CASHIER",
    password: "initial2026",
  });
  assert.equal(created.username, username);
  assert.equal("passwordHash" in created, false);

  const edited = await updateStaff(created.id, { displayName: "Bếp Step 9", role: "KITCHEN" }, owner.id);
  assert.equal(edited.role, "KITCHEN");
  const beforeReset = await prisma.staffUser.findUniqueOrThrow({ where: { id: created.id } });
  await resetStaffPassword(created.id, { password: "updated2026" });
  const afterReset = await prisma.staffUser.findUniqueOrThrow({ where: { id: created.id } });
  assert.equal(afterReset.sessionVersion, beforeReset.sessionVersion + 1);
  assert.equal(await verifyPassword("updated2026", afterReset.passwordHash), true);

  await assert.rejects(
    () => updateStaff(owner.id, { isActive: false }, owner.id),
    (error) => error instanceof SettingsError && error.code === "SELF_LOCKOUT",
  );

  const shop = await updateShopSettings({
    name: "Coffee Garden QA",
    address: "12 Đường Vườn",
    phone: "0901 234 567",
    taxCode: "0312345678",
    receiptFooter: "Cảm ơn quý khách!",
  });
  assert.equal(shop.name, "Coffee Garden QA");
  assert.equal(shop.phone, "0901 234 567");
});
