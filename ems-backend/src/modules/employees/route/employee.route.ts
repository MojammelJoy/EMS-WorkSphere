import { Router } from "express";
import { authenticate, authorize } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import { uploadAvatar as uploadAvatarMiddleware } from "@/middleware/upload.middleware";
import { createEmployeeSchema, updateEmployeeSchema } from "@/validators";
import { getAll, getById, create, update, remove, uploadAvatar } from "../controller/employee.controller";

const router = Router();
router.use(authenticate);

router.get("/",    authorize("ADMIN", "HR"), getAll);
router.get("/:id",                           getById);
router.post("/",   authorize("ADMIN", "HR"), validate(createEmployeeSchema), create);
router.put("/:id", authorize("ADMIN", "HR"), validate(updateEmployeeSchema), update);
router.delete("/:id", authorize("ADMIN"),    remove);
router.post("/:id/avatar", uploadAvatarMiddleware, uploadAvatar);

export default router;
