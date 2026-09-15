import { z } from "zod";

const name = z.string().trim().min(2, "Tên phải có ít nhất 2 ký tự.").max(80);
const displayOrder = z.coerce.number().int().min(0).max(999);

export const createCategorySchema = z.object({
  name,
  displayOrder: displayOrder.default(0),
});

export const updateCategorySchema = z
  .object({
    name: name.optional(),
    displayOrder: displayOrder.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Không có thay đổi để lưu.",
  });

export const createProductSchema = z.object({
  categoryId: z.uuid("Danh mục không hợp lệ."),
  name,
  description: z.string().trim().max(300).default(""),
  price: z.coerce.number().int().min(1_000, "Giá tối thiểu là 1.000 ₫.").max(100_000_000),
  displayOrder: displayOrder.default(0),
  isAvailable: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial().refine(
  (value) => Object.values(value).some((item) => item !== undefined),
  { message: "Không có thay đổi để lưu." },
);

export const createTableSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^T\d{2}$/, "Mã bàn có dạng T01–T99."),
  name,
  isActive: z.boolean().default(true),
});

export const updateTableSchema = createTableSchema.partial().refine(
  (value) => Object.values(value).some((item) => item !== undefined),
  { message: "Không có thay đổi để lưu." },
);
