import multer from "multer";
import { ApiError } from "@/utils/apiError";

const storage = multer.memoryStorage();

const fileFilter = (allowedTypes: string[]) =>
  (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(`File type not allowed. Allowed: ${allowedTypes.join(", ")}`, 400));
    }
  };

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter(["image/jpeg", "image/png", "image/webp"]),
}).single("avatar");

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(["application/pdf", "image/jpeg", "image/png"]),
}).single("file");
