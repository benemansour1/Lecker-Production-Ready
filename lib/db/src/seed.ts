/**
 * Database Seed Script — ليكير
 * يملأ قاعدة البيانات بالمنتجات الافتراضية إذا كانت فارغة
 *
 * الاستخدام:
 *   pnpm --filter @workspace/db run seed
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { productsTable, settingsTable } from "./schema/index.js";
import { eq } from "drizzle-orm";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL غير موجود. أضفه في ملف .env");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// Load seed data
const seedDataPath = path.join(__dirname, "seed-data.json");
const seedProducts: Array<{
  name: string;
  name_ar: string;
  category: string;
  price: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  variants: unknown;
}> = require(seedDataPath);

async function seed() {
  console.log("🌱 بدء عملية الـ seed...\n");

  // Check if products already exist
  const existing = await db.select().from(productsTable);

  if (existing.length > 0) {
    console.log(`✅ قاعدة البيانات تحتوي بالفعل على ${existing.length} منتج — لا حاجة للـ seed`);
    console.log("   (لإعادة الـ seed بالكامل، احذف المنتجات أولاً)");
    await pool.end();
    return;
  }

  console.log(`📦 إضافة ${seedProducts.length} منتج...`);

  // Insert all products
  for (const p of seedProducts) {
    await db.insert(productsTable).values({
      name: p.name,
      nameAr: p.name_ar,
      category: p.category,
      price: p.price,
      description: p.description,
      imageUrl: p.image_url,
      isActive: p.is_active,
      sortOrder: p.sort_order,
      variants: p.variants as any,
    });
  }

  console.log(`✅ تم إضافة ${seedProducts.length} منتج بنجاح!\n`);

  // Seed default settings
  const defaultSettings = [
    { key: "isOpen", value: "true" },
    { key: "deliveryEnabled", value: "true" },
    { key: "deliveryFee", value: "15" },
  ];

  console.log("⚙️  إضافة الإعدادات الافتراضية...");
  for (const s of defaultSettings) {
    const exists = await db.select().from(settingsTable).where(eq(settingsTable.key, s.key));
    if (exists.length === 0) {
      await db.insert(settingsTable).values(s);
    }
  }

  console.log("✅ تم إضافة الإعدادات الافتراضية!\n");
  console.log("🎉 الـ seed اكتمل بنجاح! يمكنك الآن تشغيل المشروع.");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ خطأ في الـ seed:", err);
  process.exit(1);
});
