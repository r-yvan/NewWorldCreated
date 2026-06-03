import { prisma } from "../../shared/prisma";
import type { ExtinguisherStatus, InspectionStatus } from "@prisma/client";

export const reportingRepository = {
  countExtinguishers(): Promise<number> {
    return prisma.extinguisher.count();
  },

  countExtinguishersSince(since: Date): Promise<number> {
    return prisma.extinguisher.count({ where: { createdAt: { gte: since } } });
  },

  async extinguisherStatusBreakdown(): Promise<
    Record<ExtinguisherStatus, number>
  > {
    const grouped = await prisma.extinguisher.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const result = {} as Record<ExtinguisherStatus, number>;
    for (const row of grouped) {
      result[row.status] = row._count._all;
    }
    return result;
  },

  async inspectionStatusBreakdown(): Promise<
    Record<InspectionStatus, number>
  > {
    const grouped = await prisma.inspection.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const result = {} as Record<InspectionStatus, number>;
    for (const row of grouped) {
      result[row.status] = row._count._all;
    }
    return result;
  },

  listExpired(now: Date) {
    return prisma.extinguisher.findMany({
      where: {
        OR: [{ status: "EXPIRED" }, { expiryDate: { lte: now } }],
      },
      orderBy: { expiryDate: "asc" },
    });
  },

  countInspections(): Promise<number> {
    return prisma.inspection.count();
  },

  countMaintenance(): Promise<number> {
    return prisma.maintenance.count();
  },

  countUsers(): Promise<number> {
    return prisma.user.count();
  },

  maintenanceWithExtinguisher() {
    return prisma.maintenance.findMany({
      include: {
        extinguisher: { select: { id: true, serialNumber: true, location: true } },
        inspector: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { maintenanceDate: "desc" },
    });
  },

  allExtinguishers() {
    return prisma.extinguisher.findMany({ orderBy: { createdAt: "desc" } });
  },
};
