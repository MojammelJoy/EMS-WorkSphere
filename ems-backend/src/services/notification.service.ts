import prisma from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { getIO } from "@/sockets";

interface CreateNotificationInput {
  userId:  string;
  title:   string;
  message: string;
  type:    NotificationType;
  link?:   string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: { userId: input.userId, title: input.title, message: input.message, type: input.type, link: input.link },
  });

  // Emit real-time event via Socket.IO
  try {
    const io = getIO();
    io.to(`user:${input.userId}`).emit("notification:new", notification);
  } catch { /* socket may not be initialized in tests */ }

  return notification;
}

export async function createBulkNotifications(inputs: CreateNotificationInput[]) {
  return Promise.allSettled(inputs.map(createNotification));
}
