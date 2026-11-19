import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actor_id: params.actorId ?? null,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        old_value:
          params.oldValue === undefined || params.oldValue === null
            ? Prisma.JsonNull
            : (JSON.parse(JSON.stringify(params.oldValue)) as Prisma.InputJsonValue),
        new_value:
          params.newValue === undefined || params.newValue === null
            ? Prisma.JsonNull
            : (JSON.parse(JSON.stringify(params.newValue)) as Prisma.InputJsonValue),
        ip_address: params.ip ?? null,
      },
    });
  } catch (e) {
    console.error("[audit] failed", e);
  }
}
