import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  createCategorySchema,
  createProductSchema,
  createTableSchema,
  updateCategorySchema,
  updateProductSchema,
  updateTableSchema,
} from "../validation";

export class ManagementError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

async function mainBranch() {
  const branch = await prisma.branch.findUnique({ where: { code: "MAIN" } });
  if (!branch) throw new ManagementError("BRANCH_NOT_FOUND", "Chưa tìm thấy cấu hình quán.", 503);
  return branch;
}

async function uniqueSlug(model: "category" | "product", name: string, excludeId?: string) {
  const branch = await mainBranch();
  const base = slugify(name);
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const slug = suffix ? `${base}-${suffix + 1}` : base;
    const record = model === "category"
      ? await prisma.category.findUnique({ where: { branchId_slug: { branchId: branch.id, slug } } })
      : await prisma.product.findUnique({ where: { branchId_slug: { branchId: branch.id, slug } } });
    if (!record || record.id === excludeId) return slug;
  }
  throw new ManagementError("SLUG_CONFLICT", "Tên này đã được sử dụng quá nhiều lần.", 409);
}

function rethrow(error: unknown): never {
  if (error instanceof ManagementError) throw error;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new ManagementError("DUPLICATE_VALUE", "Mã hoặc tên này đã tồn tại.", 409);
  }
  throw error;
}

export async function createCategory(raw: unknown) {
  const input = createCategorySchema.parse(raw);
  const branch = await mainBranch();
  try {
    return await prisma.category.create({
      data: { ...input, branchId: branch.id, slug: await uniqueSlug("category", input.name) },
    });
  } catch (error) {
    rethrow(error);
  }
}

export async function updateCategory(id: string, raw: unknown) {
  const input = updateCategorySchema.parse(raw);
  const branch = await mainBranch();
  const current = await prisma.category.findFirst({ where: { id, branchId: branch.id } });
  if (!current) throw new ManagementError("CATEGORY_NOT_FOUND", "Không tìm thấy danh mục.", 404);
  try {
    return await prisma.category.update({
      where: { id },
      data: {
        ...input,
        slug: input.name ? await uniqueSlug("category", input.name, id) : undefined,
      },
    });
  } catch (error) {
    rethrow(error);
  }
}

async function ensureCategory(categoryId: string, branchId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, branchId } });
  if (!category) throw new ManagementError("CATEGORY_NOT_FOUND", "Danh mục không tồn tại.", 400);
}

export async function createProduct(raw: unknown) {
  const input = createProductSchema.parse(raw);
  const branch = await mainBranch();
  await ensureCategory(input.categoryId, branch.id);
  try {
    return await prisma.product.create({
      data: {
        ...input,
        branchId: branch.id,
        slug: await uniqueSlug("product", input.name),
      },
    });
  } catch (error) {
    rethrow(error);
  }
}

export async function updateProduct(id: string, raw: unknown) {
  const input = updateProductSchema.parse(raw);
  const branch = await mainBranch();
  const current = await prisma.product.findFirst({ where: { id, branchId: branch.id } });
  if (!current) throw new ManagementError("PRODUCT_NOT_FOUND", "Không tìm thấy món.", 404);
  if (input.categoryId) await ensureCategory(input.categoryId, branch.id);
  try {
    return await prisma.product.update({
      where: { id },
      data: {
        ...input,
        slug: input.name ? await uniqueSlug("product", input.name, id) : undefined,
      },
    });
  } catch (error) {
    rethrow(error);
  }
}

export async function createTable(raw: unknown) {
  const input = createTableSchema.parse(raw);
  const branch = await mainBranch();
  try {
    return await prisma.diningTable.create({ data: { ...input, branchId: branch.id } });
  } catch (error) {
    rethrow(error);
  }
}

export async function updateTable(id: string, raw: unknown) {
  const input = updateTableSchema.parse(raw);
  const branch = await mainBranch();
  const current = await prisma.diningTable.findFirst({ where: { id, branchId: branch.id } });
  if (!current) throw new ManagementError("TABLE_NOT_FOUND", "Không tìm thấy bàn.", 404);
  try {
    return await prisma.diningTable.update({ where: { id }, data: input });
  } catch (error) {
    rethrow(error);
  }
}
