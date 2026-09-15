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

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "CANCELLED";

export interface OrderReceipt {
  id: string;
  orderNo: string;
  tableCode: string;
  tableName: string;
  status: OrderStatus;
  statusUpdatedAt: string;
  cancellationReason: string | null;
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

export interface KitchenOrder {
  id: string;
  orderNo: string;
  status: OrderStatus;
  tableCode: string;
  tableName: string;
  customerNote: string | null;
  cancellationReason: string | null;
  createdAt: string;
  statusUpdatedAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    itemNote: string | null;
  }>;
}
