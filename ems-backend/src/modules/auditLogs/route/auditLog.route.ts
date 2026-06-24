import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/apiResponse";
import { authenticate, authorize } from "@/middleware/auth.middleware";
import { getPaginationParams, buildPaginationMeta } from "@/utils/pagination";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/", asyncHandler(async (req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const { page, limit, skip } = getPaginationParams(req.query as never);
  const { entity, userId } = req.query as Record<string, string>;

  const where = {
    ...(entity && { entity }),
    ...(userId && { userId }),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  sendSuccess(res, { data, meta: buildPaginationMeta(total, page, limit) }, "Audit logs");
}));

export default router;
