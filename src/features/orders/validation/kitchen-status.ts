import { z } from "zod";

export const kitchenStatusSchema = z
  .object({
    status: z.enum(["PREPARING", "READY", "SERVED", "CANCELLED"]),
    cancellationReason: z.string().trim().max(200).optional(),
  })
  .superRefine((value, context) => {
    if (value.status === "CANCELLED" && !value.cancellationReason) {
      context.addIssue({
        code: "custom",
        path: ["cancellationReason"],
        message: "Vui lòng nhập lý do hủy order.",
      });
    }
  });
