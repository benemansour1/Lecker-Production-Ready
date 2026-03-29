import { Router, type IRouter } from "express";
import { db, usersTable, adminSessionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import twilio from "twilio";

const router: IRouter = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSms(to: string, body: string): Promise<void> {
  const accountSid = process.env["TWILIO_ACCOUNT_SID"];
  const authToken = process.env["TWILIO_AUTH_TOKEN"];
  const fromPhone = process.env["TWILIO_PHONE_NUMBER"];

  if (!accountSid || !authToken || !fromPhone) {
    console.log(`[OTP for ${to}]: ${body}`);
    return;
  }

  const client = twilio(accountSid, authToken);
  await client.messages.create({ body, from: fromPhone, to });
}

function parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
  const lc = ua.toLowerCase();
  let deviceType = 'desktop';
  if (/mobile|iphone|android|blackberry|windows phone/.test(lc)) deviceType = 'mobile';
  else if (/ipad|tablet/.test(lc)) deviceType = 'tablet';

  let browser = 'Unknown';
  if (/edg\//.test(lc)) browser = 'Edge';
  else if (/opr\/|opera/.test(lc)) browser = 'Opera';
  else if (/chrome/.test(lc)) browser = 'Chrome';
  else if (/safari/.test(lc)) browser = 'Safari';
  else if (/firefox/.test(lc)) browser = 'Firefox';

  let os = 'Unknown';
  if (/windows/.test(lc)) os = 'Windows';
  else if (/mac os x/.test(lc)) os = 'macOS';
  else if (/android/.test(lc)) os = 'Android';
  else if (/iphone|ipad|ios/.test(lc)) os = 'iOS';
  else if (/linux/.test(lc)) os = 'Linux';

  return { deviceType, browser, os };
}

function getClientIp(req: any): string {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) {
    const first = (typeof fwd === 'string' ? fwd : fwd[0]).split(',')[0].trim();
    return first;
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

async function fetchGeoCity(ip: string): Promise<{ city: string | null; country: string | null }> {
  try {
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      return { city: 'محلي', country: 'local' };
    }
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,status&lang=ar`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json() as any;
    if (data.status === 'success') return { city: data.city || null, country: data.country || null };
  } catch {}
  return { city: null, country: null };
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

    // Record admin session in DB
    if (user.role === 'admin') {
      const ua = req.headers['user-agent'] || '';
      const { deviceType, browser, os } = parseUserAgent(ua);
      const ip = getClientIp(req);

      // Fire-and-forget geo lookup
      fetchGeoCity(ip).then(async ({ city, country }) => {
        try {
          // Mark old sessions for same phone+device combo as inactive
          await db.insert(adminSessionsTable).values({
            sessionId: req.sessionID,
            phone: user.phone,
            ipAddress: ip,
            userAgent: ua.substring(0, 500),
            deviceType,
            browser,
            os,
            city,
            country,
            loginAt: new Date(),
            lastActiveAt: new Date(),
            isActive: true,
          });
        } catch (e) {
          console.error('[admin-session] insert error', e);
        }
      });
    }

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

router.post("/logout", async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const role = (req.session as any).role;

    // Mark admin session as inactive
    if (role === 'admin' && sessionId) {
      db.update(adminSessionsTable)
        .set({ isActive: false })
        .where(and(eq(adminSessionsTable.sessionId, sessionId), eq(adminSessionsTable.isActive, true)))
        .catch(() => {});
    }

    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الخروج" });
        return;
      }
      res.clearCookie("connect.sid");
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  } catch (err) {
    req.log.error({ err }, "Error in logout");
    res.status(500).json({ error: "حدث خطأ" });
  }
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
