import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";
import { config } from "@/config";

let io: Server;

export function initSocket(httpServer: import("http").Server): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));
    try {
      const user = verifyAccessToken(token);
      (socket as Socket & { user?: typeof user }).user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as Socket & { user?: { userId: string; role: string } }).user;
    if (!user) return;

    logger.info(`Socket connected: ${user.userId}`);
    socket.join(`user:${user.userId}`);
    socket.join(`role:${user.role}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${user.userId}`);
    });

    // Mark notification read
    socket.on("notification:read", async (id: string) => {
      const { default: prisma } = await import("@/lib/prisma");
      await prisma.notification.update({ where: { id }, data: { isRead: true } });
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
