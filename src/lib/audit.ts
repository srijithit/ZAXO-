import { prisma } from './prisma';

export async function createAuditLog(action: string, details: string, performedBy: string) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details,
        performedBy
      }
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}
