import { prisma } from "./prisma";

export type NotificationType = "FORM_SUBMITTED" | "FORM_RETURNED" | "COMMENT_ADDED" | "FORM_APPROVED";

export async function createNotification(
  formId: string,
  type: NotificationType,
  message: string,
  targetRole: "SCHULAMT" | "SCHULE" = "SCHULAMT"
) {
  return await prisma.notification.create({
    data: {
      formId,
      type,
      message,
      targetRole,
    },
  });
}

export async function getUnreadNotifications(targetRole: "SCHULAMT" | "SCHULE" = "SCHULAMT") {
  return await prisma.notification.findMany({
    where: {
      targetRole,
      read: false,
    },
    include: {
      form: {
        include: {
          school: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUnreadCount(targetRole: "SCHULAMT" | "SCHULE" = "SCHULAMT") {
  return await prisma.notification.count({
    where: {
      targetRole,
      read: false,
    },
  });
}

export async function markAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

export async function markAllAsRead(targetRole: "SCHULAMT" | "SCHULE" = "SCHULAMT") {
  return await prisma.notification.updateMany({
    where: {
      targetRole,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

export async function markFormNotificationsAsRead(formId: string, targetRole: "SCHULAMT" | "SCHULE" = "SCHULAMT") {
  return await prisma.notification.updateMany({
    where: {
      formId,
      targetRole,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}



