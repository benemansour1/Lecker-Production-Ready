import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = (req.session as any).role;
  const userId = (req.session as any).userId;

  if (!userId) {
    res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
    return;
  }

  if (role !== "admin") {
    res.status(403).json({ error: "ليس لديك صلاحية الوصول" });
    return;
  }

  next();
}
