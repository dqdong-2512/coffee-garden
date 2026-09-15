export interface PricedItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  itemNote?: string;
}

export function calculateOrderTotals(items: PricedItem[]) {
  const lines = items.map((item) => ({
    ...item,
    lineTotal: item.unitPrice * item.quantity,
  }));
  const subtotal = lines.reduce((sum, item) => sum + item.lineTotal, 0);
  return { lines, subtotal, totalAmount: subtotal };
}
