import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { sendSms, getAdminPhone } from "../lib/sms";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const { customerPhone, customerName, items, notes, deliveryAddress, deliveryType, paymentMethod } = req.body;

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

      // Determine price: use variant price if variant is specified and valid
      let price = Number(product.price);
      let variantLabel = '';
      if (item.variantName && item.variantPrice) {
        const productVariants = (product.variants as Array<{ nameAr: string; price: number }> | null) ?? [];
        const matchedVariant = productVariants.find(v => v.nameAr === item.variantName);
        if (matchedVariant) {
          price = matchedVariant.price;
          variantLabel = matchedVariant.nameAr;
        } else {
          // Allow frontend-supplied price if no match (fallback)
          price = Number(item.variantPrice);
          variantLabel = item.variantName;
        }
      }

      const subtotal = price * item.quantity;
      total += subtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productNameAr: product.nameAr + (variantLabel ? ` — ${variantLabel}` : ''),
        quantity: item.quantity,
        price,
        subtotal,
      });
    }

    // Add delivery fee if delivery type is delivery
    const isDelivery = deliveryType === "delivery" || (!deliveryType && !!deliveryAddress);
    if (isDelivery) total += 15;

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
      deliveryType: deliveryType || (deliveryAddress ? "delivery" : "pickup"),
      paymentMethod: paymentMethod || "cash",
    }).returning();

    const order = inserted[0];

    // Notify admin via SMS
    const adminPhone = getAdminPhone();
    if (adminPhone) {
      const itemsSummary = orderItems.map(i => `${i.productNameAr} x${i.quantity}`).join("، ");
      const paymentLabel = paymentMethod === "cash" ? "كاش" : paymentMethod === "online" ? "إلكتروني" : "بطاقة";
      const deliveryLabel = isDelivery ? `توصيل - ${deliveryAddress || ""}` : "استلام شخصي";
      await sendSms(adminPhone,
        `🔔 طلب جديد #${order.id}\n` +
        `👤 ${customerName || ""} | ${customerPhone}\n` +
        `🛍 ${itemsSummary}\n` +
        `💰 المجموع: ${total} ₪ | ${paymentLabel}\n` +
        `📍 ${deliveryLabel}`
      );
    }

    req.log.info({ orderId: order.id }, "New order created");

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

    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
