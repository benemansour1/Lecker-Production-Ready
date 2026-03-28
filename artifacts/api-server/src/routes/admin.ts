import { Router, type IRouter } from "express";
import { db, productsTable, ordersTable, settingsTable } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.use(requireAdmin);

// ─── Products ───────────────────────────────────────────────────────────────

router.get("/products", async (req, res) => {
  try {
    const products = await db.select().from(productsTable).orderBy(asc(productsTable.sortOrder));
    res.json(products.map(p => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error fetching admin products");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { name, nameAr, category, price, description, imageUrl, isActive, sortOrder } = req.body;

    if (!name || !nameAr || !category || price === undefined) {
      res.status(400).json({ error: "البيانات المطلوبة غير مكتملة" });
      return;
    }

    const inserted = await db.insert(productsTable).values({
      name,
      nameAr,
      category,
      price: price.toString(),
      description: description || null,
      imageUrl: imageUrl || null,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    }).returning();

    const p = inserted[0];
    res.status(201).json({ ...p, price: Number(p.price), createdAt: p.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating product");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, nameAr, category, price, description, imageUrl, isActive, sortOrder } = req.body;

    const updated = await db.update(productsTable).set({
      ...(name !== undefined && { name }),
      ...(nameAr !== undefined && { nameAr }),
      ...(category !== undefined && { category }),
      ...(price !== undefined && { price: price.toString() }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    }).where(eq(productsTable.id, id)).returning();

    if (!updated[0]) {
      res.status(404).json({ error: "المنتج غير موجود" });
      return;
    }

    const p = updated[0];
    res.json({ ...p, price: Number(p.price), createdAt: p.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating product");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ message: "تم حذف المنتج بنجاح" });
  } catch (err) {
    req.log.error({ err }, "Error deleting product");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ─── Orders ─────────────────────────────────────────────────────────────────

router.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;
    let orders;

    if (status) {
      orders = await db.select().from(ordersTable).where(eq(ordersTable.status, status as any));
    } else {
      orders = await db.select().from(ordersTable);
    }

    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(orders.map(o => ({
      ...o,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error fetching orders");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "الحالة مطلوبة" });
      return;
    }

    const updated = await db.update(ordersTable).set({
      status,
      updatedAt: new Date(),
    }).where(eq(ordersTable.id, id)).returning();

    if (!updated[0]) {
      res.status(404).json({ error: "الطلب غير موجود" });
      return;
    }

    const o = updated[0];
    res.json({ ...o, total: Number(o.total), createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating order status");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ─── Stats ───────────────────────────────────────────────────────────────────

router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const allOrders = await db.select().from(ordersTable);
    const allProducts = await db.select().from(productsTable);

    const todayOrders = allOrders.filter(o => o.createdAt >= todayStart && o.status !== "cancelled");
    const monthOrders = allOrders.filter(o => o.createdAt >= monthStart && o.status !== "cancelled");
    const pendingOrders = allOrders.filter(o => o.status === "new" || o.status === "preparing");

    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);

    res.json({
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      todayRevenue,
      monthRevenue,
      pendingOrders: pendingOrders.length,
      totalProducts: allProducts.length,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching stats");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ─── Revenue ─────────────────────────────────────────────────────────────────

router.get("/revenue/daily", async (req, res) => {
  try {
    const dateParam = req.query.date as string;
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const orders = await db.select().from(ordersTable);
    const dayOrders = orders.filter(o =>
      o.createdAt >= dayStart &&
      o.createdAt < dayEnd &&
      o.status !== "cancelled"
    );

    const hourlyMap: Record<string, { revenue: number; orders: number }> = {};
    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, "0")}:00`;
      hourlyMap[label] = { revenue: 0, orders: 0 };
    }

    for (const order of dayOrders) {
      const hour = order.createdAt.getHours();
      const label = `${hour.toString().padStart(2, "0")}:00`;
      hourlyMap[label].revenue += Number(order.total);
      hourlyMap[label].orders += 1;
    }

    const breakdown = Object.entries(hourlyMap).map(([label, data]) => ({ label, ...data }));
    const total = dayOrders.reduce((s, o) => s + Number(o.total), 0);

    res.json({ total, orderCount: dayOrders.length, breakdown });
  } catch (err) {
    req.log.error({ err }, "Error fetching daily revenue");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.get("/revenue/monthly", async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year as string) || now.getFullYear();
    const month = parseInt(req.query.month as string) || now.getMonth() + 1;

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);

    const orders = await db.select().from(ordersTable);
    const monthOrders = orders.filter(o =>
      o.createdAt >= monthStart &&
      o.createdAt < monthEnd &&
      o.status !== "cancelled"
    );

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const label = `${d}/${month}`;
      dailyMap[label] = { revenue: 0, orders: 0 };
    }

    for (const order of monthOrders) {
      const day = order.createdAt.getDate();
      const label = `${day}/${month}`;
      dailyMap[label].revenue += Number(order.total);
      dailyMap[label].orders += 1;
    }

    const breakdown = Object.entries(dailyMap).map(([label, data]) => ({ label, ...data }));
    const total = monthOrders.reduce((s, o) => s + Number(o.total), 0);

    res.json({ total, orderCount: monthOrders.length, breakdown });
  } catch (err) {
    req.log.error({ err }, "Error fetching monthly revenue");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// ─── Settings ────────────────────────────────────────────────────────────────

function parseSettings(rows: { key: string; value: string }[]) {
  const map: Record<string, string> = {};
  rows.forEach(r => { map[r.key] = r.value; });
  return {
    isOpen: map["isOpen"] === "true",
    deliveryEnabled: map["deliveryEnabled"] === "true",
    deliveryFee: Number(map["deliveryFee"] || 0),
    minOrderAmount: Number(map["minOrderAmount"] || 0),
    storeName: map["storeName"] || "lecker",
    storePhone: map["storePhone"] || "",
    storeAddress: map["storeAddress"] || "",
  };
}

router.get("/settings", async (req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    res.json(parseSettings(rows));
  } catch (err) {
    req.log.error({ err }, "Error fetching settings");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const { isOpen, deliveryEnabled, deliveryFee, minOrderAmount, storeName, storePhone, storeAddress } = req.body;

    const updates: Record<string, string> = {};
    if (isOpen !== undefined) updates["isOpen"] = String(isOpen);
    if (deliveryEnabled !== undefined) updates["deliveryEnabled"] = String(deliveryEnabled);
    if (deliveryFee !== undefined) updates["deliveryFee"] = String(deliveryFee);
    if (minOrderAmount !== undefined) updates["minOrderAmount"] = String(minOrderAmount);
    if (storeName !== undefined) updates["storeName"] = storeName;
    if (storePhone !== undefined) updates["storePhone"] = storePhone;
    if (storeAddress !== undefined) updates["storeAddress"] = storeAddress;

    for (const [key, value] of Object.entries(updates)) {
      const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
      if (existing.length > 0) {
        await db.update(settingsTable).set({ value }).where(eq(settingsTable.key, key));
      } else {
        await db.insert(settingsTable).values({ key, value });
      }
    }

    const rows = await db.select().from(settingsTable);
    res.json(parseSettings(rows));
  } catch (err) {
    req.log.error({ err }, "Error updating settings");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
