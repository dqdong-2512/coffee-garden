import { Prisma } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { mapStaff, staffSelect } from "./queries";
import {
  createStaffSchema,
  resetStaffPasswordSchema,
  updateShopSettingsSchema,
  updateStaffSchema,
} from "./validation";

export class SettingsError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

function rethrow(error: unknown): never {
  if (error instanceof SettingsError) throw error;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new SettingsError("DUPLICATE_USERNAME", "Tên đăng nhập này đã được sử dụng.", 409);
  }
  throw error;
}

export async function createStaff(raw: unknown) {
  const input = createStaffSchema.parse(raw);
  try {
    const row = await prisma.staffUser.create({
      data: {
        username: input.username,
        displayName: input.displayName,
        role: input.role,
        passwordHash: await hashPassword(input.password),
      },
      select: staffSelect,
    });
    return mapStaff(row);
  } catch (error) {
    rethrow(error);
  }
}

export async function updateStaff(id: string, raw: unknown, actorId: string) {
  const input = updateStaffSchema.parse(raw);
  try {
    return await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('staff-owner-management'))::text`;
      const current = await transaction.staffUser.findUnique({ where: { id } });
      if (!current) throw new SettingsError("STAFF_NOT_FOUND", "Không tìm thấy tài khoản nhân viên.", 404);
      if (id === actorId && (input.isActive === false || (input.role && input.role !== "OWNER"))) {
        throw new SettingsError("SELF_LOCKOUT", "Bạn không thể khóa hoặc hạ quyền tài khoản đang đăng nhập.", 409);
      }
      const removesActiveOwner = current.role === "OWNER" && current.isActive &&
        (input.isActive === false || (input.role && input.role !== "OWNER"));
      if (removesActiveOwner) {
        const activeOwners = await transaction.staffUser.count({ where: { role: "OWNER", isActive: true } });
        if (activeOwners <= 1) {
          throw new SettingsError("LAST_OWNER", "Quán phải luôn có ít nhất một tài khoản Owner hoạt động.", 409);
        }
      }
      const roleChanged = input.role !== undefined && input.role !== current.role;
      const deactivated = input.isActive === false && current.isActive;
      const row = await transaction.staffUser.update({
        where: { id },
        data: {
          ...input,
          sessionVersion: roleChanged || deactivated ? { increment: 1 } : undefined,
        },
        select: staffSelect,
      });
      return mapStaff(row);
    });
  } catch (error) {
    rethrow(error);
  }
}

export async function resetStaffPassword(id: string, raw: unknown) {
  const input = resetStaffPasswordSchema.parse(raw);
  const passwordHash = await hashPassword(input.password);
  try {
    const result = await prisma.staffUser.updateMany({
      where: { id },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    if (!result.count) throw new SettingsError("STAFF_NOT_FOUND", "Không tìm thấy tài khoản nhân viên.", 404);
    return { id };
  } catch (error) {
    rethrow(error);
  }
}

export async function updateShopSettings(raw: unknown) {
  const input = updateShopSettingsSchema.parse(raw);
  const result = await prisma.branch.updateMany({ where: { code: "MAIN" }, data: input });
  if (!result.count) throw new SettingsError("BRANCH_NOT_FOUND", "Chưa tìm thấy cấu hình quán.", 503);
  return prisma.branch.findUniqueOrThrow({
    where: { code: "MAIN" },
    select: { id: true, name: true, address: true, phone: true, taxCode: true, receiptFooter: true },
  });
}
