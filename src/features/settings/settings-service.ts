import { Prisma, type StaffPermissionCode, type StaffRole } from "@/generated/prisma/client";
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

function primaryRole(permissions: StaffPermissionCode[]): StaffRole {
  if (permissions.includes("AUDIT")) return "OWNER";
  if (permissions.includes("KITCHEN") && !permissions.includes("ORDER")) return "KITCHEN";
  return "CASHIER";
}

export async function createStaff(raw: unknown) {
  const input = createStaffSchema.parse(raw);
  try {
    const row = await prisma.staffUser.create({
      data: {
        username: input.username,
        displayName: input.displayName,
        role: primaryRole(input.permissions),
        passwordHash: await hashPassword(input.password),
        permissionAssignments: {
          create: input.permissions.map((permissionCode) => ({ permissionCode })),
        },
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
      await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('staff-permission-management'))::text`;
      const current = await transaction.staffUser.findUnique({
        where: { id },
        include: { permissionAssignments: { select: { permissionCode: true } } },
      });
      if (!current) throw new SettingsError("STAFF_NOT_FOUND", "Không tìm thấy tài khoản nhân viên.", 404);
      if (current.isSuperAdmin && (input.isActive === false || input.permissions !== undefined)) {
        throw new SettingsError(
          "SUPER_ADMIN_PROTECTED",
          "Không thể khóa hoặc thay đổi quyền của tài khoản Super Admin duy nhất.",
          409,
        );
      }
      if (id === actorId && input.isActive === false) {
        throw new SettingsError("SELF_LOCKOUT", "Bạn không thể khóa tài khoản đang đăng nhập.", 409);
      }
      const currentPermissions = current.permissionAssignments.map((item) => item.permissionCode).sort();
      const nextPermissions = input.permissions?.slice().sort();
      const permissionsChanged = nextPermissions !== undefined &&
        nextPermissions.join(",") !== currentPermissions.join(",");
      const deactivated = input.isActive === false && current.isActive;
      const row = await transaction.staffUser.update({
        where: { id },
        data: {
          displayName: input.displayName,
          isActive: input.isActive,
          role: input.permissions ? primaryRole(input.permissions) : undefined,
          permissionAssignments: input.permissions ? {
            deleteMany: {},
            create: input.permissions.map((permissionCode) => ({ permissionCode })),
          } : undefined,
          sessionVersion: permissionsChanged || deactivated ? { increment: 1 } : undefined,
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
