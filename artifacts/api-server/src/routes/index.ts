import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import { db, isDbAvailable, settingsTable } from "@workspace/db";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/admin", adminRouter);

// Public store status endpoint (no auth required)
router.get("/settings", async (req, res) => {
  if (!isDbAvailable) {
    return res.json({ isOpen: true, deliveryEnabled: true });
  }
  try {
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = {};
    rows.forEach((r) => { map[r.key] = r.value; });
    res.json({
      isOpen: map["isOpen"] !== "false",
      deliveryEnabled: map["deliveryEnabled"] !== "false",
    });
  } catch {
    res.json({ isOpen: true, deliveryEnabled: true });
  }
});

export default router;
