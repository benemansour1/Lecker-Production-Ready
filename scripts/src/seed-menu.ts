import { db, productsTable } from "@workspace/db";

type Variant = { nameAr: string; price: number };

const products: Array<{
  name: string;
  nameAr: string;
  category: string;
  price: number;
  description?: string;
  variants?: Variant[];
  sortOrder: number;
}> = [
  // ─── وافل ─────────────────────────────────────────────────
  { name: "Waffle", nameAr: "وافل عادي", category: "وافل", price: 34, sortOrder: 10 },
  { name: "Waffle Double", nameAr: "وافل كفول / طبقتين", category: "وافل", price: 80, sortOrder: 11 },

  // ─── كريب ─────────────────────────────────────────────────
  { name: "Crepe Snickers", nameAr: "كريب سنيكرس", category: "كريب", price: 38, sortOrder: 20 },
  { name: "Crepe Kinder", nameAr: "كريب كندر", category: "كريب", price: 35, sortOrder: 21 },
  { name: "Crepe Nutella", nameAr: "كريب نوتيلا", category: "كريب", price: 30, sortOrder: 22 },
  { name: "Crepe Lotus", nameAr: "كريب لوتس", category: "كريب", price: 38, sortOrder: 23 },

  // ─── بانكيك ───────────────────────────────────────────────
  { name: "Pancake Mkoplet", nameAr: "بانكيك مكوبلت", category: "بانكيك", price: 38, sortOrder: 30 },
  { name: "Pancake Ferrero", nameAr: "بانكيك فيريرو", category: "بانكيك", price: 40, sortOrder: 31 },
  { name: "Pancake Nutella", nameAr: "بانكيك نوتيلا", category: "بانكيك", price: 35, sortOrder: 32 },
  { name: "Pancake Kinder", nameAr: "بانكيك كندر", category: "بانكيك", price: 40, sortOrder: 33 },
  { name: "Pancake Snickers", nameAr: "بانكيك سنيكرس", category: "بانكيك", price: 40, sortOrder: 34 },
  { name: "Pancake Lotus", nameAr: "بانكيك لوتس", category: "بانكيك", price: 40, sortOrder: 35 },

  // ─── بوظة ─────────────────────────────────────────────────
  { name: "Yogurt Ice Cream", nameAr: "بوظة يوجورت", category: "بوظة", price: 28, sortOrder: 40,
    variants: [{ nameAr: "صغير", price: 28 }, { nameAr: "كبير", price: 33 }] },
  { name: "גלידה פיצוץ אוריו", nameAr: "גלידה פיצוץ אוריו", category: "بوظة", price: 19, sortOrder: 41,
    variants: [{ nameAr: "عادي - 19 ₪", price: 19 }, { nameAr: "مع توبينج إضافي - 23 ₪", price: 23 }] },
  { name: "גלידה אמריקאית", nameAr: "גלידה אמריקאית", category: "بوظة", price: 23, sortOrder: 42,
    variants: [{ nameAr: "קטן - 23 ₪", price: 23 }, { nameAr: "גדול - 28 ₪", price: 28 }] },
  { name: "גלידה איטלקית", nameAr: "גלידה איטלקית", category: "بوظة", price: 15, sortOrder: 43,
    variants: [{ nameAr: "כדור אחד - 15 ₪", price: 15 }, { nameAr: "שני כדורים - 28 ₪", price: 28 }, { nameAr: "שלושה כדורים - 38 ₪", price: 38 }] },

  // ─── فشافيش ───────────────────────────────────────────────
  { name: "Chips", nameAr: "فشافيش", category: "فشافيش", price: 30, sortOrder: 50,
    variants: [{ nameAr: "صغير - 30 ₪", price: 30 }, { nameAr: "وسط - 45 ₪", price: 45 }, { nameAr: "كبير - 50 ₪", price: 50 }] },

  // ─── أكل ──────────────────────────────────────────────────
  { name: "Cheese Toast", nameAr: "توست جبنة", category: "أكل", price: 38, sortOrder: 60 },
  { name: "Bagel Toast", nameAr: "بيجلي توست", category: "أكل", price: 38, sortOrder: 61 },
  { name: "Schnitzel & Chips", nameAr: "شنيتسل وشيبس", category: "أكل", price: 58, sortOrder: 62 },
  { name: "Fries", nameAr: "بطاطا شيبس", category: "أكل", price: 18, sortOrder: 63,
    variants: [{ nameAr: "صغير - 18 ₪", price: 18 }, { nameAr: "كبير - 25 ₪", price: 25 }] },
  { name: "Chicken Strips", nameAr: "نكنكيوت", category: "أكل", price: 25, sortOrder: 64 },
  { name: "Chicken Wrap", nameAr: "لفة مع جاج", category: "أكل", price: 45, sortOrder: 65 },
  { name: "כריך אנטריקוט טרי ללא שיפס", nameAr: "כריך אנטריקוט טרי ללא שיפס", category: "أكل", price: 49, sortOrder: 66 },

  // ─── مشروبات ساخنة ─────────────────────────────────────
  { name: "Nespresso", nameAr: "نسبرسو", category: "مشروبات ساخنة", price: 15, sortOrder: 70,
    variants: [{ nameAr: "صغير - 15 ₪", price: 15 }, { nameAr: "كبير - 17 ₪", price: 17 }] },
  { name: "Hafuch", nameAr: "הפוך", category: "مشروبات ساخنة", price: 15, sortOrder: 71,
    variants: [{ nameAr: "صغير - 15 ₪", price: 15 }, { nameAr: "كبير - 17 ₪", price: 17 }] },
  { name: "Espresso", nameAr: "اسبرسو", category: "مشروبات ساخنة", price: 9, sortOrder: 72 },
  { name: "Tea", nameAr: "شاي", category: "مشروبات ساخنة", price: 8, sortOrder: 73 },

  // ─── مشروبات باردة ─────────────────────────────────────
  { name: "Sprite", nameAr: "سبرايت", category: "مشروبات باردة", price: 9, sortOrder: 80 },
  { name: "Coca Cola", nameAr: "كولا عادي", category: "مشروبات باردة", price: 9, sortOrder: 81 },
  { name: "Coca Cola Zero", nameAr: "كولا زيرو", category: "مشروبات باردة", price: 9, sortOrder: 82 },
  { name: "Water", nameAr: "مياه", category: "مشروبات باردة", price: 8, sortOrder: 83 },
  { name: "Grapefruit Juice", nameAr: "אשכוליות", category: "مشروبات باردة", price: 9, sortOrder: 84 },
  { name: "Strawberry Banana Juice", nameAr: "תות בננה", category: "مشروبات باردة", price: 9, sortOrder: 85 },
  { name: "Grape Juice", nameAr: "ענבים", category: "مشروبات باردة", price: 9, sortOrder: 86 },
  { name: "XL Energy Drink", nameAr: "XL", category: "مشروبات باردة", price: 8, sortOrder: 87 },
  { name: "Soda", nameAr: "סודה", category: "مشروبات باردة", price: 8, sortOrder: 88 },
  { name: "Orange Juice", nameAr: "تفاحيم", category: "مشروبات باردة", price: 9, sortOrder: 89 },
  { name: "Natural Orange Juice", nameAr: "تفاحيم طبيعي", category: "مشروبات باردة", price: 18, sortOrder: 90 },
  { name: "Natural Pomegranate Juice", nameAr: "رمان طبيعي", category: "مشروبات باردة", price: 25, sortOrder: 91 },
  { name: "Blue Energy Drink", nameAr: "בלו", category: "مشروبات باردة", price: 8, sortOrder: 92 },
  { name: "Mixed Fruit Juice", nameAr: "ميكس فواكه", category: "مشروبات باردة", price: 25, sortOrder: 93 },
  { name: "Carrot Juice", nameAr: "גזר", category: "مشروبات باردة", price: 18, sortOrder: 94 },

  // ─── بيرا ─────────────────────────────────────────────────
  { name: "Corona Beer", nameAr: "كورونا", category: "بيرا", price: 18, sortOrder: 100 },
  { name: "Paulaner Beer", nameAr: "باولانير", category: "بيرا", price: 25, sortOrder: 101 },
  { name: "Carlsberg Beer", nameAr: "جارسبلج", category: "بيرا", price: 18, sortOrder: 102 },
  { name: "Stella Beer", nameAr: "ستيلا", category: "بيرا", price: 18, sortOrder: 103 },
  { name: "Weihenstephan Beer", nameAr: "فاينشتيفين", category: "بيرا", price: 25, sortOrder: 104 },
  { name: "Tuborg Beer", nameAr: "توبورج", category: "بيرا", price: 18, sortOrder: 105 },

  // ─── حلويات خاصة ─────────────────────────────────────────
  { name: "Churros", nameAr: "צ'ורוס", category: "حلويات خاصة", price: 38, sortOrder: 110 },
  { name: "Fondue", nameAr: "פונדו", category: "حلويات خاصة", price: 50, sortOrder: 111,
    variants: [{ nameAr: "صغير - 50 ₪", price: 50 }, { nameAr: "كبير - 90 ₪", price: 90 }] },
];

async function seed() {
  console.log("🌱 Seeding menu products...");

  // Clear existing products
  await db.delete(productsTable);
  console.log("✓ Cleared existing products");

  for (const product of products) {
    await db.insert(productsTable).values({
      name: product.name,
      nameAr: product.nameAr,
      category: product.category,
      price: product.price.toString(),
      description: null,
      imageUrl: null,
      isActive: true,
      sortOrder: product.sortOrder,
      variants: product.variants ?? null,
    });
    console.log(`  + ${product.nameAr}`);
  }

  console.log(`\n✅ Done! Inserted ${products.length} products`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
