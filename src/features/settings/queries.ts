import { prisma } from "@/lib/db/prisma";
import type { ManagedStaff, ShopSettings } from "./types";

const staffSelect = {
  id: true,
  username: true,
  displayName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapStaff(row: {
  id: string;
  username: string;
  displayName: string;
  role: ManagedStaff["role"];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ManagedStaff {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export async function listStaff(): Promise<ManagedStaff[]> {
  const rows = await prisma.staffUser.findMany({
    select: staffSelect,
    orderBy: [{ isActive: "desc" }, { role: "asc" }, { displayName: "asc" }],
  });
  return rows.map(mapStaff);
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
