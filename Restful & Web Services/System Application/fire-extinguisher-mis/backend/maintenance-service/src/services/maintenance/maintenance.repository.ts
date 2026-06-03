import type { Maintenance, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";

const includeRelations = {
  extinguisher: { select: { id: true, serialNumber: true, location: true } },
  inspector: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.MaintenanceInclude;

export const maintenanceRepository = {
  findMany(args: Prisma.MaintenanceFindManyArgs): Promise<Maintenance[]> {
    return prisma.maintenance.findMany({ ...args, include: includeRelations });
  },

  count(where: Prisma.MaintenanceWhereInput): Promise<number> {
    return prisma.maintenance.count({ where });
  },

  findById(id: string) {
    return prisma.maintenance.findUnique({
      where: { id },
      include: includeRelations,
    });
  },

  create(data: Prisma.MaintenanceCreateInput) {
    return prisma.maintenance.create({ data, include: includeRelations });
  },

  update(id: string, data: Prisma.MaintenanceUpdateInput) {
    return prisma.maintenance.update({
      where: { id },
      data,
      include: includeRelations,
    });
  },

  delete(id: string) {
    return prisma.maintenance.delete({ where: { id } });
  },
};
