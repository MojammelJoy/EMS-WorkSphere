import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "@/utils/apiError";

export const validate = (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body:   req.body,
        query:  req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((e) => {
          const key = e.path.slice(1).join(".");
          if (!errors[key]) errors[key] = [];
          errors[key].push(e.message);
        });
        return next(ApiError.badRequest("Validation failed", errors));
      }
      next(error);
    }
  };
