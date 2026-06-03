import type { Prisma } from "@prisma/client";
import { maintenanceRepository } from "./maintenance.repository";
import { extinguisherRepository } from "../extinguisher/extinguisher.repository";
import { getPagination, buildPaginationMeta } from "../../shared/pagination";
import type { PaginationMeta } from "../../shared/response";
import { NotFoundError } from "../../shared/errors";
import { recordAudit } from "../../shared/audit";
import type {
  CreateMaintenanceInput,
  ListMaintenanceQuery,
  UpdateMaintenanceInput,
} from "./maintenance.validation";

export const maintenanceService = {
  async list(
    query: ListMaintenanceQuery
  ): Promise<{ items: unknown[]; pagination: PaginationMeta }> {
    const { page, limit, skip } = getPagination(query.page, query.limit);

    const where: Prisma.MaintenanceWhereInput = {};
    if (query.extinguisherId) where.extinguisherId = query.extinguisherId;
    if (query.inspectorId) where.inspectorId = query.inspectorId;

    const [items, total] = await Promise.all([
      maintenanceRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      maintenanceRepository.count(where),
    ]);

    return { items, pagination: buildPaginationMeta(total, page, limit) };
  },

  async getById(id: string) {
    const item = await maintenanceRepository.findById(id);
    if (!item) throw new NotFoundError("Maintenance record not found");
    return item;
  },

  async create(input: CreateMaintenanceInput, actorId?: string) {
    const extinguisher = await extinguisherRepository.findById(
      input.extinguisherId
    );
    if (!extinguisher) throw new NotFoundError("Extinguisher not found");

    const data: Prisma.MaintenanceCreateInput = {
      extinguisher: { connect: { id: input.extinguisherId } },
      actionTaken: input.actionTaken,
      conditionNotes: input.conditionNotes,
      maintenanceDate: input.maintenanceDate,
      ...(input.inspectorId
        ? { inspector: { connect: { id: input.inspectorId } } }
        : actorId
        ? { inspector: { connect: { id: actorId } } }
        : {}),
    };

    const item = await maintenanceRepository.create(data);
    await recordAudit({
      userId: actorId ?? null,
      action: "MAINTENANCE_CREATED",
      entity: "Maintenance",
      entityId: item.id,
      metadata: { extinguisherId: input.extinguisherId },
    });
    return item;
  },

  async update(id: string, input: UpdateMaintenanceInput, actorId?: string) {
    const existing = await maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundError("Maintenance record not found");

    const data: Prisma.MaintenanceUpdateInput = {
      actionTaken: input.actionTaken,
      conditionNotes: input.conditionNotes,
      maintenanceDate: input.maintenanceDate,
    };
    if (input.inspectorId === null) {
      data.inspector = { disconnect: true };
    } else if (input.inspectorId) {
      data.inspector = { connect: { id: input.inspectorId } };
    }

    const item = await maintenanceRepository.update(id, data);
    await recordAudit({
      userId: actorId ?? null,
      action: "MAINTENANCE_UPDATED",
      entity: "Maintenance",
      entityId: id,
    });
    return item;
  },

  async remove(id: string, actorId?: string): Promise<void> {
    const existing = await maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundError("Maintenance record not found");
    await maintenanceRepository.delete(id);
    await recordAudit({
      userId: actorId ?? null,
      action: "MAINTENANCE_DELETED",
      entity: "Maintenance",
      entityId: id,
    });
  },
};
