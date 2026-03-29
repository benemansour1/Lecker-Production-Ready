import { Router, type IRouter } from "express";
import { db, isDbAvailable, productsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const router: IRouter = Router();

// JSON fallback when DATABASE_URL is not set
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type SeedProduct = {
  id: number;
  name: string;
  name_ar: string;
  category: string;
  price: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  variants: unknown;
};

let _fallbackProducts: SeedProduct[] | null = null;

function getFallbackProducts(): SeedProduct[] {
  if (!_fallbackProducts) {
    try {
      const seedPath = path.resolve(__dirname, "../../../../lib/db/src/seed-data.json");
      _fallbackProducts = require(seedPath);
    } catch {
      _fallbackProducts = [];
    }
  }
  return _fallbackProducts!;
}

function mapFallback(p: SeedProduct, id?: number) {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.name_ar,
    category: p.category,
    price: Number(p.price),
    description: p.description,
    imageUrl: p.image_url,
    isActive: p.is_active,
    sortOrder: p.sort_order,
    variants: p.variants,
    createdAt: new Date().toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    if (!isDbAvailable) {
      let products = getFallbackProducts().filter(p => p.is_active);
      if (category) products = products.filter(p => p.category === category);
      products = products.sort((a, b) => a.sort_order - b.sort_order);
      return res.json(products.map(p => mapFallback(p)));
    }

    let products;
    if (category) {
      products = await db.select().from(productsTable)
        .where(eq(productsTable.isActive, true))
        .orderBy(asc(productsTable.sortOrder));
      products = products.filter(p => p.category === category);
    } else {
      products = await db.select().from(productsTable)
        .where(eq(productsTable.isActive, true))
        .orderBy(asc(productsTable.sortOrder));
    }

    const result = products.map(p => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching products");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
