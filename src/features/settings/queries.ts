import { prisma } from "@/lib/db/prisma";
import type { ManagedStaff, PermissionDefinition, ShopSettings } from "./types";
import type { Prisma } from "@/generated/prisma/client";

const staffSelect = {
  id: true,
  username: true,
  displayName: true,
  isSuperAdmin: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  permissionAssignments: {
    select: { permissionCode: true },
    orderBy: { permissionCode: "asc" as const },
  },
} as const;

type StaffRow = Prisma.StaffUserGetPayload<{ select: typeof staffSelect }>;

function mapStaff(row: StaffRow): ManagedStaff {
  const { permissionAssignments, ...staff } = row;
  return {
    ...staff,
    permissions: permissionAssignments.map((item) => item.permissionCode),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listStaff(): Promise<ManagedStaff[]> {
  const rows = await prisma.staffUser.findMany({
    select: staffSelect,
    orderBy: [{ isSuperAdmin: "desc" }, { isActive: "desc" }, { displayName: "asc" }],
  });
  return rows.map(mapStaff);
}

export async function listPermissionDefinitions(): Promise<PermissionDefinition[]> {
  return prisma.permission.findMany({
    select: { code: true, name: true, description: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getShopSettings(): Promise<ShopSettings> {
  const branch = await prisma.branch.findUnique({
    where: { code: "MAIN" },
    select: { id: true, name: true, address: true, phone: true, taxCode: true, receiptFooter: true },
  });
  if (!branch) throw new Error("Main branch is not configured.");
  return branch;
}

export { staffSelect, mapStaff };
