import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/smm/db/prisma";

export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      ip: params.ip ?? null
    }
  });
}
