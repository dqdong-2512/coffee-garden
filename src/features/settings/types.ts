import type { StaffRole } from "@/generated/prisma/client";

export type ManagedStaff = {
  id: string;
  username: string;
  displayName: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShopSettings = {
  id: string;
  name: string;
  address: string;
  phone: string;
  taxCode: string;
  receiptFooter: string;
};
