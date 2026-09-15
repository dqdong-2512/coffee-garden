import { z } from "zod";

export const customerOrderSchema = z
  .object({
    clientRequestId: z.string().uuid(),
    tableCode: z.string().trim().toUpperCase().regex(/^T\d{2}$/),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().min(1).max(20),
          itemNote: z.string().trim().max(200).optional(),
        }),
      )
      .min(1)
      .max(20),
    customerNote: z.string().trim().max(300).optional(),
  })
  .superRefine((value, context) => {
    const ids = new Set(value.items.map((item) => item.productId));
    if (ids.size !== value.items.length) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Mỗi món chỉ được xuất hiện một lần.",
      });
    }
    const quantity = value.items.reduce((sum, item) => sum + item.quantity, 0);
    if (quantity > 50) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Mỗi lượt đặt tối đa 50 phần.",
      });
    }
  });
