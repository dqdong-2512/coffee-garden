CREATE TYPE "StaffPermissionCode" AS ENUM ('ORDER', 'KITCHEN', 'AUDIT');

ALTER TABLE "StaffUser"
ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Permission" (
  "code" "StaffPermissionCode" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "StaffPermissionAssignment" (
  "staffUserId" UUID NOT NULL,
  "permissionCode" "StaffPermissionCode" NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffPermissionAssignment_pkey" PRIMARY KEY ("staffUserId", "permissionCode")
);

CREATE INDEX "StaffPermissionAssignment_permissionCode_idx"
ON "StaffPermissionAssignment"("permissionCode");

ALTER TABLE "StaffPermissionAssignment"
ADD CONSTRAINT "StaffPermissionAssignment_staffUserId_fkey"
FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffPermissionAssignment"
ADD CONSTRAINT "StaffPermissionAssignment_permissionCode_fkey"
FOREIGN KEY ("permissionCode") REFERENCES "Permission"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Permission" ("code", "name", "description", "displayOrder") VALUES
  ('ORDER', 'Gọi món', 'Chọn bàn, tạo order và ghi nhận thanh toán tại POS.', 10),
  ('KITCHEN', 'Bếp', 'Nhận order và cập nhật tiến độ chế biến.', 20),
  ('AUDIT', 'Kiểm toán', 'Xem và quản lý báo cáo, tài chính, tồn kho và vận hành.', 30);

UPDATE "StaffUser"
SET "isSuperAdmin" = true
WHERE "id" = (
  SELECT "id"
  FROM "StaffUser"
  WHERE "role" = 'OWNER'
  ORDER BY "isActive" DESC, "createdAt" ASC
  LIMIT 1
);

INSERT INTO "StaffPermissionAssignment" ("staffUserId", "permissionCode")
SELECT "id", 'ORDER'::"StaffPermissionCode" FROM "StaffUser"
WHERE "role" = 'CASHIER'
ON CONFLICT DO NOTHING;

INSERT INTO "StaffPermissionAssignment" ("staffUserId", "permissionCode")
SELECT "id", 'KITCHEN'::"StaffPermissionCode" FROM "StaffUser"
WHERE "role" = 'KITCHEN'
ON CONFLICT DO NOTHING;

INSERT INTO "StaffPermissionAssignment" ("staffUserId", "permissionCode")
SELECT "id", permission."code"
FROM "StaffUser"
CROSS JOIN "Permission" permission
WHERE "role" = 'OWNER' AND "isSuperAdmin" = false
ON CONFLICT DO NOTHING;

CREATE UNIQUE INDEX "StaffUser_single_super_admin"
ON "StaffUser" ("isSuperAdmin")
WHERE "isSuperAdmin" = true;
