import { Router } from "express";
import { validate } from "@/middleware/validate.middleware";
import { authenticate } from "@/middleware/auth.middleware";
import {
  loginSchema, forgotPasswordSchema,
  resetPasswordSchema, changePasswordSchema,
} from "@/validators";
import {
  login, logout, refreshToken,
  forgotPassword, resetPassword, changePassword, getMe,
} from "../controller/auth.controller";

const router = Router();

router.post("/login",           validate(loginSchema),           login);
router.post("/logout",          authenticate,                    logout);
router.post("/refresh",                                          refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema),  forgotPassword);
router.post("/reset-password",  validate(resetPasswordSchema),   resetPassword);
router.put("/change-password",  authenticate, validate(changePasswordSchema), changePassword);
router.get("/me",               authenticate,                    getMe);

export default router;
