import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
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
