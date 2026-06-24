import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess, sendCreated, sendNoContent } from "@/utils/apiResponse";
import { authenticate, authorize } from "@/middleware/auth.middleware";
import { uploadDocument as uploadDocMiddleware } from "@/middleware/upload.middleware";
import { ApiError } from "@/utils/apiError";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { CLOUDINARY } from "@/constants";

const router = Router();
router.use(authenticate);

router.get("/", authorize("ADMIN", "HR"), asyncHandler(async (req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const docs = await prisma.document.findMany({
    orderBy: { uploadedAt: "desc" },
    include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
  });
  sendSuccess(res, docs, "Documents fetched");
}));

router.get("/:employeeId", asyncHandler(async (req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const docs = await prisma.document.findMany({
    where:   { employeeId: req.params.employeeId },
    orderBy: { uploadedAt: "desc" },
  });
  sendSuccess(res, docs, "Documents fetched");
}));

router.post("/:employeeId", authorize("ADMIN", "HR"), uploadDocMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const { name, type } = req.body as { name: string; type: string };

  const uploaded = await uploadToCloudinary(req.file.buffer, CLOUDINARY.DOCUMENTS_FOLDER);

  const { default: prisma } = await import("@/lib/prisma");
  const doc = await prisma.document.create({
    data: {
      employeeId:  req.params.employeeId,
      name,
      type:        type as "RESUME" | "NATIONAL_ID" | "CERTIFICATE" | "CONTRACT" | "PAYSLIP" | "OTHER",
      url:         uploaded.url,
      cloudinaryId:uploaded.publicId,
      size:        uploaded.size,
      mimeType:    req.file.mimetype,
    },
  });

  sendCreated(res, doc, "Document uploaded");
}));

router.delete("/:id", authorize("ADMIN", "HR"), asyncHandler(async (req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) throw ApiError.notFound("Document not found");

  await deleteFromCloudinary(doc.cloudinaryId);
  await prisma.document.delete({ where: { id: req.params.id } });
  sendNoContent(res);
}));

export default router;
