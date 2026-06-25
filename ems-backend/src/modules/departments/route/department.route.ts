import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess, sendCreated, sendNoContent } from "@/utils/apiResponse";
import { authenticate, authorize } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import { createDepartmentSchema, updateDepartmentSchema } from "@/validators";
import {
  listDepartments, createDepartment,
  updateDepartment, deleteDepartment,
} from "../service/department.service";

const router = Router();
router.use(authenticate);

router.get("/", asyncHandler(async (_req, res) => {
  sendSuccess(res, await listDepartments(), "Departments fetched");
}));

router.post("/", authorize("ADMIN", "HR"), validate(createDepartmentSchema), asyncHandler(async (req, res) => {
  sendCreated(res, await createDepartment(req.body as never), "Department created");
}));

router.put("/:id", authorize("ADMIN", "HR"), validate(updateDepartmentSchema), asyncHandler(async (req, res) => {
  sendSuccess(res, await updateDepartment(String(req.params.id), req.body as never), "Department updated");
}));

router.delete("/:id", authorize("ADMIN"), asyncHandler(async (req, res) => {
  await deleteDepartment(String(req.params.id));
  sendNoContent(res);
}));

export default router;
