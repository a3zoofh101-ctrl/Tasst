import "server-only";
import { prisma } from "@/lib/smm/db/prisma";

export type NotificationType =
  | "ORDER_RECEIVED"
  | "ORDER_COMPLETED"
  | "ORDER_REFUNDED"
  | "WALLET_CREDITED"
  | "SUPPORT_REPLY";

export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link
    }
  });
}
