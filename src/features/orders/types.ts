export interface CustomerOrderItemInput {
  productId: string;
  quantity: number;
  itemNote?: string;
}

export interface CustomerOrderInput {
  clientRequestId: string;
  tableCode: string;
  items: CustomerOrderItemInput[];
  customerNote?: string;
}

export interface OrderReceipt {
  id: string;
  orderNo: string;
  tableCode: string;
  tableName: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
  totalAmount: number;
  customerNote: string | null;
  createdAt: string;
  items: Array<{
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    itemNote: string | null;
  }>;
}
