import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const { customerPhone, customerName, items, notes, deliveryAddress, paymentMethod } = req.body;

    if (!customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "بيانات الطلب غير مكتملة" });
      return;
    }

    let total = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const products = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      const product = products[0];

      if (!product) {
        res.status(400).json({ error: `المنتج غير موجود: ${item.productId}` });
        return;
      }

      if (!product.isActive) {
        res.status(400).json({ error: `المنتج غير متاح: ${product.nameAr}` });
        return;
      }

      const price = Number(product.price);
      const subtotal = price * item.quantity;
      total += subtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productNameAr: product.nameAr,
        quantity: item.quantity,
        price,
        subtotal,
      });
    }

    const userId = (req.session as any).userId;

    const inserted = await db.insert(ordersTable).values({
      userId: userId || null,
      customerPhone,
      customerName: customerName || null,
      status: "new",
      total: total.toString(),
      items: orderItems,
      notes: notes || null,
      deliveryAddress: deliveryAddress || null,
      paymentMethod: paymentMethod || "cash",
    }).returning();

    const order = inserted[0];
    res.status(201).json({
      ...order,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating order");
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الطلب" });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));

    res.json(orders.map(o => ({
      ...o,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error fetching my orders");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
