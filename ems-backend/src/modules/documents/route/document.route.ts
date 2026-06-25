import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess, sendCreated, sendNoContent } from "@/utils/apiResponse";
import { authenticate, authorize } from "@/middleware/auth.middleware";
import { uploadDocument as uploadDocMiddleware } from "@/middleware/upload.middleware";
import { ApiError } from "@/utils/apiError";
import path from "path";
import fs from "fs";

const router = Router();
router.use(authenticate);

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "documents");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function saveLocally(buffer: Buffer, filename: string): { url: string; publicId: string; size: number } {
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(UPLOADS_DIR, safeName);
  fs.writeFileSync(filePath, buffer);
  return {
    url:      `/uploads/documents/${safeName}`,
    publicId: safeName,
    size:     buffer.length,
  };
}

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
    where:   { employeeId: String(req.params.employeeId) },
    orderBy: { uploadedAt: "desc" },
  });
  sendSuccess(res, docs, "Documents fetched");
}));

router.post("/:employeeId", authorize("ADMIN", "HR"), uploadDocMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const { name, type } = req.body as { name: string; type: string };

  const saved = saveLocally(req.file.buffer, req.file.originalname);

  const { default: prisma } = await import("@/lib/prisma");
  const doc = await prisma.document.create({
    data: {
      employeeId:   String(req.params.employeeId),
      name:         name || req.file.originalname,
      type:         (type || "OTHER") as "RESUME" | "NATIONAL_ID" | "CERTIFICATE" | "CONTRACT" | "PAYSLIP" | "OTHER",
      url:          saved.url,
      cloudinaryId: saved.publicId,
      size:         saved.size,
      mimeType:     req.file.mimetype,
    },
  });

  sendCreated(res, doc, "Document uploaded");
}));

router.delete("/:id", authorize("ADMIN", "HR"), asyncHandler(async (req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const doc = await prisma.document.findUnique({ where: { id: String(req.params.id) } });
  if (!doc) throw ApiError.notFound("Document not found");

  const filePath = path.join(UPLOADS_DIR, doc.cloudinaryId);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.document.delete({ where: { id: String(req.params.id) } });
  sendNoContent(res);
}));

export default router;
