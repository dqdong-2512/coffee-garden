import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { customerOrderSchema } from "../validation/customer-order";
import type { CustomerOrderInput, OrderReceipt } from "../types";
import { calculateOrderTotals } from "./order-calculations";
import { OrderServiceError } from "./order-errors";

const receiptInclude = {
  table: { select: { code: true, name: true } },
  items: { orderBy: { createdAt: "asc" as const } },
};

type SavedOrder = Prisma.OrderGetPayload<{ include: typeof receiptInclude }>;

function toReceipt(order: SavedOrder): OrderReceipt {
  return {
    id: order.id,
    orderNo: order.orderNo,
    tableCode: order.table.code,
    tableName: order.table.name,
    status: order.status,
    totalAmount: order.totalAmount,
    customerNote: order.customerNote,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      itemNote: item.itemNote,
    })),
  };
}

function vietnamBusinessDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const iso = `${value.year}-${value.month}-${value.day}`;
  return {
    iso,
    compact: `${value.year}${value.month}${value.day}`,
    databaseDate: new Date(`${iso}T00:00:00.000Z`),
  };
}

function requestHash(input: CustomerOrderInput) {
  const canonical = {
    tableCode: input.tableCode,
    items: [...input.items]
      .map((item) => ({ ...item, itemNote: item.itemNote ?? "" }))
      .sort((left, right) => left.productId.localeCompare(right.productId)),
    customerNote: input.customerNote ?? "",
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export async function createCustomerOrder(rawInput: unknown) {
  const parsed = customerOrderSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new OrderServiceError(
      "INVALID_ORDER",
      400,
      parsed.error.issues[0]?.message ?? "Order không hợp lệ.",
    );
  }

  const input = parsed.data;
  const hash = requestHash(input);

  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`
      SELECT pg_advisory_xact_lock(hashtext(${input.clientRequestId}))::text
    `;

    const table = await transaction.diningTable.findFirst({
      where: {
        code: input.tableCode,
        isActive: true,
        branch: { isActive: true },
      },
      include: { branch: true },
    });
    if (!table) {
      throw new OrderServiceError(
        "TABLE_UNAVAILABLE",
        404,
        "Bàn không hợp lệ hoặc đang tạm ngưng phục vụ.",
      );
    }

    const existing = await transaction.order.findUnique({
      where: {
        branchId_clientRequestId: {
          branchId: table.branchId,
          clientRequestId: input.clientRequestId,
        },
      },
      include: receiptInclude,
    });
    if (existing) {
      if (existing.requestHash !== hash) {
        throw new OrderServiceError(
          "REQUEST_CONFLICT",
          409,
          "Lượt gửi này đã được dùng cho một order khác.",
        );
      }
      return { order: toReceipt(existing), replayed: true };
    }

    const recentOrders = await transaction.order.count({
      where: {
        tableId: table.id,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recentOrders >= 8) {
      throw new OrderServiceError(
        "TOO_MANY_ORDERS",
        429,
        "Bàn vừa gửi nhiều order. Vui lòng chờ một phút hoặc gọi nhân viên.",
      );
    }

    const products = await transaction.product.findMany({
      where: {
        id: { in: input.items.map((item) => item.productId) },
        branchId: table.branchId,
        isAvailable: true,
        category: { isActive: true },
      },
      select: { id: true, name: true, price: true },
    });
    if (products.length !== input.items.length) {
      throw new OrderServiceError(
        "PRODUCT_UNAVAILABLE",
        409,
        "Một món trong giỏ hiện không còn phục vụ. Vui lòng chọn lại.",
      );
    }

    const pricedItems = input.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        throw new OrderServiceError(
          "PRODUCT_UNAVAILABLE",
          409,
          "Một món trong giỏ hiện không còn phục vụ.",
        );
      }
      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        itemNote: item.itemNote,
      };
    });
    const totals = calculateOrderTotals(pricedItems);
    const date = vietnamBusinessDate();
    const [counter] = await transaction.$queryRaw<Array<{ lastValue: number }>>`
      INSERT INTO "OrderDailyCounter" ("branchId", "businessDate", "lastValue")
      VALUES (${table.branchId}::uuid, ${date.databaseDate}, 1)
      ON CONFLICT ("branchId", "businessDate")
      DO UPDATE SET "lastValue" = "OrderDailyCounter"."lastValue" + 1
      RETURNING "lastValue"
    `;
    if (!counter) {
      throw new OrderServiceError(
        "ORDER_NUMBER_FAILED",
        503,
        "Chưa thể cấp mã order. Vui lòng thử lại.",
      );
    }

    const orderNo = `CG-${date.compact}-${String(counter.lastValue).padStart(4, "0")}`;
    const order = await transaction.order.create({
      data: {
        branchId: table.branchId,
        tableId: table.id,
        clientRequestId: input.clientRequestId,
        requestHash: hash,
        orderNo,
        source: "CUSTOMER_QR",
        subtotal: totals.subtotal,
        totalAmount: totals.totalAmount,
        customerNote: input.customerNote || null,
        items: {
          create: totals.lines.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            itemNote: item.itemNote || null,
          })),
        },
      },
      include: receiptInclude,
    });

    return { order: toReceipt(order), replayed: false };
  });
}
