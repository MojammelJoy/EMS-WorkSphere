import { Response, NextFunction } from "express";
import prisma from "@/lib/prisma";
import type { AuthRequest } from "@/types";

interface AuditOptions {
  action: string;
  entity: string;
  getEntityId?: (req: AuthRequest) => string | undefined;
}

export const auditLog = ({ action, entity, getEntityId }: AuditOptions) =>
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            userId:    req.user.userId,
            action,
            entity,
            entityId:  getEntityId?.(req) ?? String(req.params.id ?? ""),
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          },
        });
      }
    } catch { /* non-fatal */ }
    next();
  };
