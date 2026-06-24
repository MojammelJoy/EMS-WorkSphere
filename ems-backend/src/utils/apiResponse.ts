import { Response } from "express";
import { HTTP_STATUS } from "@/constants";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = HTTP_STATUS.OK
) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendCreated<T>(res: Response, data: T, message = "Created successfully") {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

export function sendNoContent(res: Response) {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
}
