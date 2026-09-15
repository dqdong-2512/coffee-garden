import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

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
}

seed()
  .then(() => console.log("Seed hoàn tất: MAIN, 2 danh mục, 10 món và bàn T01–T12."))
  .finally(() => prisma.$disconnect());
