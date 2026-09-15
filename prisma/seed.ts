import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");
const databaseUrl: string = connectionString;

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

function isLocalDatabase(url: string) {
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

const products = [
  ["food", "bun-bo-hue", "Bún bò Huế", "Nước dùng thơm sả, thịt bò mềm, chả và rau tươi.", 55000],
  ["food", "bo-kho", "Bò kho", "Bò hầm mềm cùng cà rốt, dùng kèm bánh mì giòn.", 55000],
  ["food", "banh-mi-chao", "Bánh mì chảo", "Trứng ốp la, xúc xích, pa-tê và sốt cà chua.", 49000],
  ["drink", "ca-phe-den-da", "Cà phê đen đá", "Cà phê phin đậm vị, thêm đá mát lạnh.", 25000],
  ["drink", "ca-phe-den-nong", "Cà phê đen nóng", "Một tách cà phê phin thơm nồng, nguyên vị.", 25000],
  ["drink", "ca-phe-sua", "Cà phê sữa", "Cà phê phin hòa cùng sữa đặc, dùng với đá.", 30000],
  ["drink", "bac-xiu", "Bạc xỉu", "Sữa béo dịu, điểm một chút cà phê thơm.", 32000],
  ["drink", "nuoc-cam", "Nước cam", "Cam tươi vắt tại quầy, ngọt thanh và mát lành.", 35000],
  ["drink", "sinh-to-dau", "Sinh tố dâu", "Dâu xay cùng sữa, chua ngọt cân bằng.", 40000],
  ["drink", "sinh-to-bo", "Sinh tố bơ", "Bơ chín xay mịn với sữa, béo bùi tự nhiên.", 42000],
] as const;

async function seed() {
  const local = isLocalDatabase(databaseUrl);
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || (local ? "coffee-owner-local" : "");
  const kitchenPassword = process.env.SEED_KITCHEN_PASSWORD || (local ? "coffee-kitchen-local" : "");
  const cashierPassword = process.env.SEED_CASHIER_PASSWORD || (local ? "coffee-cashier-local" : "");
  if (!ownerPassword || !kitchenPassword || !cashierPassword) {
    throw new Error(
      "Explicit Owner, Kitchen and Cashier seed passwords are required for a non-local database.",
    );
  }

  const [ownerHash, kitchenHash, cashierHash] = await Promise.all([
    hashPassword(ownerPassword),
    hashPassword(kitchenPassword),
    hashPassword(cashierPassword),
  ]);
  await prisma.staffUser.upsert({
    where: { username: process.env.SEED_OWNER_USERNAME || "owner" },
    create: {
      username: process.env.SEED_OWNER_USERNAME || "owner",
      displayName: "Chủ quán",
      passwordHash: ownerHash,
      role: "OWNER",
    },
    update: { displayName: "Chủ quán", role: "OWNER", isActive: true },
  });
  await prisma.staffUser.upsert({
    where: { username: process.env.SEED_CASHIER_USERNAME || "cashier" },
    create: {
      username: process.env.SEED_CASHIER_USERNAME || "cashier",
      displayName: "Thu ngân",
      passwordHash: cashierHash,
      role: "CASHIER",
    },
    update: { displayName: "Thu ngân", role: "CASHIER", isActive: true },
  });
  await prisma.staffUser.upsert({
    where: { username: process.env.SEED_KITCHEN_USERNAME || "kitchen" },
    create: {
      username: process.env.SEED_KITCHEN_USERNAME || "kitchen",
      displayName: "Bếp & pha chế",
      passwordHash: kitchenHash,
      role: "KITCHEN",
    },
    update: { displayName: "Bếp & pha chế", role: "KITCHEN", isActive: true },
  });

  const branch = await prisma.branch.upsert({
    where: { code: "MAIN" },
    create: { code: "MAIN", name: "Coffee Garden - Main Branch" },
    update: {},
  });

  const food = await prisma.category.upsert({
    where: { branchId_slug: { branchId: branch.id, slug: "food" } },
    create: { branchId: branch.id, name: "Đồ ăn", slug: "food", displayOrder: 1 },
    update: {},
  });
  const drink = await prisma.category.upsert({
    where: { branchId_slug: { branchId: branch.id, slug: "drink" } },
    create: { branchId: branch.id, name: "Thức uống", slug: "drink", displayOrder: 2 },
    update: {},
  });

  for (const [index, [categorySlug, slug, name, description, price]] of products.entries()) {
    await prisma.product.upsert({
      where: { branchId_slug: { branchId: branch.id, slug } },
      create: {
        branchId: branch.id,
        categoryId: categorySlug === "food" ? food.id : drink.id,
        slug,
        name,
        description,
        price,
        displayOrder: index + 1,
      },
      update: {},
    });
  }

  for (let number = 1; number <= 12; number += 1) {
    const code = `T${String(number).padStart(2, "0")}`;
    await prisma.diningTable.upsert({
      where: { branchId_code: { branchId: branch.id, code } },
      create: { branchId: branch.id, code, name: `Bàn ${number}` },
      update: {},
    });
  }

  const owner = await prisma.staffUser.findUniqueOrThrow({
    where: { username: process.env.SEED_OWNER_USERNAME || "owner" },
  });
  const ingredientSeeds = [
    ["coffee-bean", "Cà phê hạt", "GRAM", 10_000, 2_000, 180],
    ["condensed-milk", "Sữa đặc", "MILLILITER", 15_000, 3_000, 35],
    ["beef", "Thịt bò", "GRAM", 30_000, 5_000, 220],
    ["rice-noodle", "Bún tươi", "GRAM", 20_000, 4_000, 25],
    ["bread", "Bánh mì", "PIECE", 100, 20, 5_000],
    ["egg", "Trứng gà", "PIECE", 120, 24, 3_000],
    ["orange", "Cam tươi", "GRAM", 20_000, 4_000, 80],
    ["strawberry", "Dâu tây", "GRAM", 10_000, 2_000, 90],
    ["avocado", "Bơ", "GRAM", 10_000, 2_000, 60],
  ] as const;
  const ingredientBySlug = new Map<string, { id: string }>();
  for (const [slug, name, unit, currentQuantity, lowStockThreshold, costPerUnit] of ingredientSeeds) {
    const ingredient = await prisma.ingredient.upsert({
      where: { branchId_slug: { branchId: branch.id, slug } },
      create: { branchId: branch.id, slug, name, unit, currentQuantity, lowStockThreshold, costPerUnit },
      update: {},
    });
    ingredientBySlug.set(slug, ingredient);
    await prisma.stockMovement.upsert({
      where: { externalRef: `SEED-STOCK-${slug}` },
      create: {
        externalRef: `SEED-STOCK-${slug}`, branchId: branch.id, ingredientId: ingredient.id,
        createdById: owner.id, type: "STOCK_IN", quantity: currentQuantity, balanceAfter: currentQuantity,
        unitCost: costPerUnit, totalCost: currentQuantity * costPerUnit, note: "Tồn kho khởi tạo",
      },
      update: {},
    });
  }
  const recipeSeeds: Record<string, Array<[string, number]>> = {
    "bun-bo-hue": [["beef", 100], ["rice-noodle", 200]],
    "bo-kho": [["beef", 120], ["bread", 1]],
    "banh-mi-chao": [["bread", 1], ["egg", 1], ["beef", 50]],
    "ca-phe-den-da": [["coffee-bean", 20]],
    "ca-phe-den-nong": [["coffee-bean", 20]],
    "ca-phe-sua": [["coffee-bean", 20], ["condensed-milk", 30]],
    "bac-xiu": [["coffee-bean", 10], ["condensed-milk", 60]],
    "nuoc-cam": [["orange", 250]],
    "sinh-to-dau": [["strawberry", 180], ["condensed-milk", 40]],
    "sinh-to-bo": [["avocado", 200], ["condensed-milk", 40]],
  };
  const seededProducts = await prisma.product.findMany({ where: { branchId: branch.id } });
  for (const product of seededProducts) {
    for (const [ingredientSlug, quantity] of recipeSeeds[product.slug] ?? []) {
      const ingredient = ingredientBySlug.get(ingredientSlug);
      if (!ingredient) continue;
      await prisma.recipeItem.upsert({
        where: { productId_ingredientId: { productId: product.id, ingredientId: ingredient.id } },
        create: { productId: product.id, ingredientId: ingredient.id, quantity },
        update: {},
      });
    }
  }
  const sampleExpenses = [
    ["SEED-EX001", "2026-09-14", "INGREDIENT", 1_800_000, "Đà Lạt Coffee Co.", "Cà phê hạt · 10 kg", "BANK_TRANSFER"],
    ["SEED-EX002", "2026-09-14", "INGREDIENT", 950_000, "Chợ An Phú", "Rau và nguyên liệu đồ ăn sáng", "CASH"],
    ["SEED-EX003", "2026-09-12", "ELECTRICITY", 4_200_000, "EVN", "Tiền điện tháng 9", "BANK_TRANSFER"],
    ["SEED-EX004", "2026-09-10", "SALARY", 12_000_000, "Nhân sự Coffee Garden", "Tạm ứng lương", "BANK_TRANSFER"],
    ["SEED-EX005", "2026-09-05", "MARKETING", 2_400_000, "Local Studio", "Chiến dịch quảng bá tháng 9", "BANK_TRANSFER"],
    ["SEED-EX006", "2026-09-01", "RENT", 18_000_000, "Nguyễn Văn Hùng", "Tiền thuê mặt bằng tháng 9", "BANK_TRANSFER"],
  ] as const;
  for (const [externalRef, date, category, amount, supplier, description, paymentMethod] of sampleExpenses) {
    await prisma.expense.upsert({
      where: { externalRef },
      create: {
        externalRef,
        branchId: branch.id,
        createdById: owner.id,
        incurredAt: new Date(`${date}T00:00:00.000Z`),
        category,
        amount,
        supplier,
        description,
        paymentMethod,
      },
      update: {},
    });
  }
}

seed()
  .then(() => console.log("Seed hoàn tất: tài khoản, menu, bàn, chi phí, nguyên liệu và công thức mẫu."))
  .finally(() => prisma.$disconnect());
