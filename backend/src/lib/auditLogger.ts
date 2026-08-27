import prisma from './prisma';

export interface AuditEventInput {
  businessId?: string | null;
  userId?: string | null;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any>;
}

export async function logAuditEvent(input: AuditEventInput) {
  try {
    await prisma.auditLog.create({
      data: {
        businessId: input.businessId || null,
        userId: input.userId || null,
        actorEmail: input.actorEmail,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        details: input.details || {},
      },
    });
  } catch (err) {
    console.error('[AuditLogger] Failed to write audit log entry:', err);
  }
}
