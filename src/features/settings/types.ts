import type { StaffPermissionCode } from "@/generated/prisma/client";

export type ManagedStaff = {
  id: string;
  username: string;
  displayName: string;
  isSuperAdmin: boolean;
  permissions: StaffPermissionCode[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PermissionDefinition = {
  code: StaffPermissionCode;
  name: string;
  description: string;
};

export type ShopSettings = {
  id: string;
  name: string;
  address: string;
  phone: string;
  taxCode: string;
  receiptFooter: string;
};
