import "dotenv/config";
import { PrismaClient, ProductCondition } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ["error"],
});

async function main() {
  console.log("🌱 Seeding RigNova database...");

  // Brands
  const brands = await Promise.all(
    [
      { name: "NVIDIA", slug: "nvidia" },
      { name: "AMD", slug: "amd" },
      { name: "Intel", slug: "intel" },
      { name: "ASUS", slug: "asus" },
      { name: "MSI", slug: "msi" },
      { name: "Corsair", slug: "corsair" },
      { name: "Samsung", slug: "samsung" },
      { name: "RigNova", slug: "rignova" },
      { name: "Sony", slug: "sony" },
    ].map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand,
      })
    )
  );

  // Categories
  const categories = await Promise.all(
    [
      { name: "Gaming PCs", slug: "gaming-pcs", sortOrder: 1 },
      { name: "Graphics Cards", slug: "gpus", sortOrder: 2 },
      { name: "Processors", slug: "cpus", sortOrder: 3 },
      { name: "Motherboards", slug: "motherboards", sortOrder: 4 },
      { name: "Memory", slug: "ram", sortOrder: 5 },
      { name: "Storage", slug: "storage", sortOrder: 6 },
      { name: "Power Supply", slug: "psu", sortOrder: 7 },
      { name: "Cabinets", slug: "cabinets", sortOrder: 8 },
      { name: "Coolers", slug: "coolers", sortOrder: 9 },
      { name: "Monitors", slug: "monitors", sortOrder: 10 },
      { name: "Accessories", slug: "accessories", sortOrder: 11 },
      { name: "Gaming Consoles", slug: "consoles", sortOrder: 12 },
      { name: "Used GPUs", slug: "used-gpus", sortOrder: 13 },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );

  const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b.id]));
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // Products
  const products = [
    {
      name: "NovaStrike RTX 5080 Gaming PC",
      slug: "novastrike-rtx-5080",
      sku: "RN-PC-001",
      price: 189999,
      compareAtPrice: 219999,
      brandId: brandMap.rignova,
      categoryId: catMap["gaming-pcs"],
      isFeatured: true,
      stock: 15,
    },
    {
      name: "NVIDIA GeForce RTX 5080 Founders Edition",
      slug: "rtx-5080-fe",
      sku: "RN-GPU-001",
      price: 124999,
      compareAtPrice: 139999,
      brandId: brandMap.nvidia,
      categoryId: catMap.gpus,
      isFeatured: true,
      stock: 25,
    },
    {
      name: "AMD Ryzen 9 9950X Processor",
      slug: "ryzen-9-9950x",
      sku: "RN-CPU-001",
      price: 58999,
      brandId: brandMap.amd,
      categoryId: catMap.cpus,
      stock: 40,
    },
    {
      name: "Corsair Vengeance RGB 32GB DDR5",
      slug: "corsair-vengeance-32gb",
      sku: "RN-RAM-001",
      price: 12999,
      compareAtPrice: 14999,
      brandId: brandMap.corsair,
      categoryId: catMap.ram,
      hasRgb: true,
      stock: 60,
    },
    {
      name: "Samsung 990 Pro 2TB NVMe SSD",
      slug: "samsung-990-pro-2tb",
      sku: "RN-SSD-001",
      price: 18999,
      brandId: brandMap.samsung,
      categoryId: catMap.storage,
      stock: 80,
    },
    {
      name: "RTX 4070 Ti Super (Used - Grade A)",
      slug: "rtx-4070ti-used",
      sku: "RN-UGPU-001",
      price: 54999,
      compareAtPrice: 79999,
      brandId: brandMap.nvidia,
      categoryId: catMap["used-gpus"],
      condition: ProductCondition.USED_EXCELLENT,
      stock: 5,
    },
    {
      name: "PlayStation 5 Pro Console",
      slug: "ps5-pro",
      sku: "RN-CON-001",
      price: 64999,
      brandId: brandMap.sony,
      categoryId: catMap.consoles,
      stock: 20,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        description: `Premium ${product.name} — engineered for peak gaming performance.`,
        shortDescription: `High-performance ${product.name}`,
      },
    });
  }

  // PC Component Types
  const componentTypes = [
    { name: "CPU", slug: "cpu", sortOrder: 1 },
    { name: "Motherboard", slug: "motherboard", sortOrder: 2 },
    { name: "RAM", slug: "ram", sortOrder: 3 },
    { name: "GPU", slug: "gpu", sortOrder: 4 },
    { name: "SSD", slug: "ssd", sortOrder: 5 },
    { name: "HDD", slug: "hdd", sortOrder: 6, isRequired: false },
    { name: "PSU", slug: "psu", sortOrder: 7 },
    { name: "Cabinet", slug: "cabinet", sortOrder: 8 },
    { name: "Cooler", slug: "cooler", sortOrder: 9 },
    { name: "Monitor", slug: "monitor", sortOrder: 10, isRequired: false },
  ];

  for (const type of componentTypes) {
    await prisma.pcComponentType.upsert({
      where: { slug: type.slug },
      update: {},
      create: type,
    });
  }

  // SEO Settings
  await prisma.seoSetting.upsert({
    where: { page: "home" },
    update: {},
    create: {
      page: "home",
      title: "RigNova — Build Beyond Limits | Gaming Hardware India",
      description:
        "Premium gaming PCs, custom builds, used GPUs, and components. Shop the latest RTX graphics cards, AMD processors, and gaming accessories.",
      keywords: "gaming PC, GPU, RTX, custom PC builder, used graphics card, India",
    },
  });

  // Sample coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 5000,
      maxDiscount: 10000,
      usageLimit: 1000,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`   Brands: ${brands.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products: ${products.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
