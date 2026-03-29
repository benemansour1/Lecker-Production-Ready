import { Router, type IRouter } from "express";
import { db, isDbAvailable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import twilio from "twilio";

const router: IRouter = Router();

// Block auth routes when no DB is available
router.use((req, res, next) => {
  if (!isDbAvailable) {
    res.status(503).json({
      error: "تسجيل الدخول غير متاح — قاعدة البيانات غير متصلة. أضف DATABASE_URL في ملف .env",
    });
    return;
  }
  next();
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSms(to: string, body: string): Promise<void> {
  const accountSid = process.env["TWILIO_ACCOUNT_SID"];
  const authToken = process.env["TWILIO_AUTH_TOKEN"];
  const fromPhone = process.env["TWILIO_PHONE_NUMBER"];

  if (!accountSid || !authToken || !fromPhone) {
    // Twilio not configured - log OTP for development
    console.log(`[OTP for ${to}]: ${body}`);
    return;
  }

  const client = twilio(accountSid, authToken);
  await client.messages.create({ body, from: fromPhone, to });
}

router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: "رقم الهاتف مطلوب" });
      return;
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingUsers = await db.select().from(usersTable).where(eq(usersTable.phone, phone));

    if (existingUsers.length > 0) {
      await db.update(usersTable)
        .set({ otpCode: otp, otpExpiresAt })
        .where(eq(usersTable.phone, phone));
    } else {
      await db.insert(usersTable).values({
        phone,
        otpCode: otp,
        otpExpiresAt,
        role: "user",
      });
    }

    const hasTwilio = !!(process.env["TWILIO_ACCOUNT_SID"] && process.env["TWILIO_AUTH_TOKEN"] && process.env["TWILIO_PHONE_NUMBER"]);

    await sendSms(phone, `رمز التحقق لـ lecker: ${otp}\nصالح لمدة 10 دقائق.`);

    req.log.info({ phone }, "OTP generated and sent");

    if (hasTwilio) {
      res.json({ message: "تم إرسال رمز التحقق إلى هاتفك" });
    } else {
      res.json({ message: `رمز التحقق: ${otp} (تجريبي - لتفعيل SMS الحقيقي أضف Twilio)` });
    }
  } catch (err) {
    req.log.error({ err }, "Error in send-otp");
    res.status(500).json({ error: "حدث خطأ، يرجى المحاولة مجدداً" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ error: "رقم الهاتف ورمز التحقق مطلوبان" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
    const user = users[0];

    if (!user) {
      res.status(400).json({ error: "رقم الهاتف غير موجود" });
      return;
    }

    if (user.otpCode !== otp) {
      res.status(400).json({ error: "رمز التحقق غير صحيح" });
      return;
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      res.status(400).json({ error: "انتهت صلاحية رمز التحقق" });
      return;
    }

    await db.update(usersTable)
      .set({ otpCode: null, otpExpiresAt: null })
      .where(eq(usersTable.id, user.id));

    (req.session as any).userId = user.id;
    (req.session as any).role = user.role;

    const { otpCode, otpExpiresAt, ...safeUser } = user;
    res.json({
      user: { ...safeUser, createdAt: safeUser.createdAt.toISOString() },
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (err) {
    req.log.error({ err }, "Error in verify-otp");
    res.status(500).json({ error: "حدث خطأ، يرجى المحاولة مجدداً" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "حدث خطأ أثناء تسجيل الخروج" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });
});

router.get("/me", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const user = users[0];
    if (!user) {
      res.status(401).json({ error: "المستخدم غير موجود" });
      return;
    }

    const { otpCode, otpExpiresAt, ...safeUser } = user;
    res.json({ ...safeUser, createdAt: safeUser.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error in /me");
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
