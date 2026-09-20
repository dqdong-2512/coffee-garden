import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";

export type PosCatalog = {
  branch: { id: string; name: string };
  categories: CatalogCategory[];
  products: CatalogProduct[];
  tables: Array<{ id: string; code: string; name: string }>;
};

export type StaffTableDirectory = {
  branch: { id: string; name: string };
  tables: Array<{ id: string; code: string; name: string }>;
};

export type PaymentOrder = {
  id: string;
  orderNo: string;
  tableName: string;
  source: "CUSTOMER_QR" | "POS";
  status: string;
  totalAmount: number;
  createdAt: string;
  payment: null | {
    id: string;
    method: "CASH" | "BANK_TRANSFER";
    status: "PAID" | "VOIDED";
    amount: number;
    reference: string | null;
    note: string | null;
    receivedAt: string;
    voidReason: string | null;
    createdByName: string;
  };
};
