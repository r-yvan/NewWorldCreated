import type { Inspection, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";

const includeRelations = {
  extinguisher: { select: { id: true, serialNumber: true, location: true } },
  inspector: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.InspectionInclude;

export const inspectionRepository = {
  findMany(args: Prisma.InspectionFindManyArgs): Promise<Inspection[]> {
    return prisma.inspection.findMany({ ...args, include: includeRelations });
  },

  count(where: Prisma.InspectionWhereInput): Promise<number> {
    return prisma.inspection.count({ where });
  },

  findById(id: string) {
    return prisma.inspection.findUnique({
      where: { id },
      include: includeRelations,
    });
  },

  findActiveDuplicate(extinguisherId: string) {
    return prisma.inspection.findFirst({
      where: { extinguisherId, status: "PENDING" },
    });
  },

  create(data: Prisma.InspectionCreateInput) {
    return prisma.inspection.create({ data, include: includeRelations });
  },

  update(id: string, data: Prisma.InspectionUpdateInput) {
    return prisma.inspection.update({
      where: { id },
      data,
      include: includeRelations,
    });
  },

  delete(id: string) {
    return prisma.inspection.delete({ where: { id } });
  },
};
