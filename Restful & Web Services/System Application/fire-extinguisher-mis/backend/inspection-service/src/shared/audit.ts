import { prisma } from "./prisma";
import { logger } from "./logger";

export interface AuditInput {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

// Persists an audit trail entry. Never throws into the request flow.
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? undefined) as object | undefined,
      },
    });
  } catch (err) {
    logger.error("Failed to write audit log", {
      error: err instanceof Error ? err.message : String(err),
      action: input.action,
      entity: input.entity,
    });
  }
}
