import type { OrderSource, OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

export type PrintableOrder = {
  id: string;
  orderNo: string;
  source: OrderSource;
  status: OrderStatus;
  tableCode: string;
  tableName: string;
  customerNote: string | null;
  totalAmount: number;
  createdAt: string;
  shop: {
    name: string;
    address: string;
    phone: string;
    taxCode: string;
    receiptFooter: string;
  };
  items: Array<{
    id: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    itemNote: string | null;
  }>;
  payment: null | {
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    reference: string | null;
    receivedAt: string;
    createdByName: string;
  };
};
