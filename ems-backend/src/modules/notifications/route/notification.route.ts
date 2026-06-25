import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/apiResponse";
import { authenticate } from "@/middleware/auth.middleware";
import type { AuthRequest } from "@/types";

const router = Router();
router.use(authenticate);

router.get("/", asyncHandler(async (req: AuthRequest, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const { page = "1", limit = "20", unreadOnly } = req.query as Record<string, string>;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    userId: req.user!.userId,
    ...(unreadOnly === "true" && { isRead: false }),
  };

  const [data, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: "desc" } }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } }),
  ]);

  sendSuccess(res, { data, total, unreadCount }, "Notifications fetched");
}));

router.get("/unread-count", asyncHandler(async (req: AuthRequest, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const count = await prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } });
  sendSuccess(res, { count }, "Unread count");
}));

router.patch("/read-all", asyncHandler(async (req: AuthRequest, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  await prisma.notification.updateMany({ where: { userId: req.user!.userId, isRead: false }, data: { isRead: true } });
  sendSuccess(res, null, "All marked as read");
}));

router.patch("/:id/read", asyncHandler(async (req: AuthRequest, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  await prisma.notification.update({ where: { id: String(req.params.id), userId: req.user!.userId }, data: { isRead: true } });
  sendSuccess(res, null, "Marked as read");
}));

export default router;
