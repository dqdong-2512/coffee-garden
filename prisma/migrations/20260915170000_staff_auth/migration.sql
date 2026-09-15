CREATE TYPE "StaffRole" AS ENUM ('OWNER', 'KITCHEN');

CREATE TABLE "StaffUser" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffUser_username_key" ON "StaffUser"("username");
CREATE INDEX "StaffUser_role_isActive_idx" ON "StaffUser"("role", "isActive");
