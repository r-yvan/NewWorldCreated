import type { Extinguisher, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";

export const extinguisherRepository = {
  findMany(args: Prisma.ExtinguisherFindManyArgs): Promise<Extinguisher[]> {
    return prisma.extinguisher.findMany(args);
  },

  count(where: Prisma.ExtinguisherWhereInput): Promise<number> {
    return prisma.extinguisher.count({ where });
  },

  findById(id: string): Promise<Extinguisher | null> {
    return prisma.extinguisher.findUnique({ where: { id } });
  },

  findBySerial(serialNumber: string): Promise<Extinguisher | null> {
    return prisma.extinguisher.findUnique({ where: { serialNumber } });
  },

  create(data: Prisma.ExtinguisherCreateInput): Promise<Extinguisher> {
    return prisma.extinguisher.create({ data });
  },

  update(
    id: string,
    data: Prisma.ExtinguisherUpdateInput
  ): Promise<Extinguisher> {
    return prisma.extinguisher.update({ where: { id }, data });
  },

  delete(id: string): Promise<Extinguisher> {
    return prisma.extinguisher.delete({ where: { id } });
  },
};
