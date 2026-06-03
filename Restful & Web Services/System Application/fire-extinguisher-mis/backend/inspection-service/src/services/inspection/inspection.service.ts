import type { Prisma } from "@prisma/client";
import { inspectionRepository } from "./inspection.repository";
import { extinguisherRepository } from "../extinguisher/extinguisher.repository";
import { getPagination, buildPaginationMeta } from "../../shared/pagination";
import type { PaginationMeta } from "../../shared/response";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/errors";
import { recordAudit } from "../../shared/audit";
import type {
  CreateInspectionInput,
  ListInspectionsQuery,
  UpdateInspectionInput,
} from "./inspection.validation";

// Combine a scheduled date (date part) with an HH:mm time into a Date.
function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

export const inspectionService = {
  async list(
    query: ListInspectionsQuery
  ): Promise<{ items: unknown[]; pagination: PaginationMeta }> {
    const { page, limit, skip } = getPagination(query.page, query.limit);

    const where: Prisma.InspectionWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.extinguisherId) where.extinguisherId = query.extinguisherId;
    if (query.inspectorId) where.inspectorId = query.inspectorId;

    const [items, total] = await Promise.all([
      inspectionRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      inspectionRepository.count(where),
    ]);

    return { items, pagination: buildPaginationMeta(total, page, limit) };
  },

  async getById(id: string) {
    const item = await inspectionRepository.findById(id);
    if (!item) throw new NotFoundError("Inspection not found");
    return item;
  },

  async create(input: CreateInspectionInput, actorId?: string) {
    const extinguisher = await extinguisherRepository.findById(
      input.extinguisherId
    );
    if (!extinguisher) throw new NotFoundError("Extinguisher not found");

    const scheduled = combineDateTime(input.scheduledDate, input.scheduledTime);
    if (scheduled.getTime() < Date.now()) {
      throw new BadRequestError("Cannot schedule an inspection in the past");
    }

    const duplicate = await inspectionRepository.findActiveDuplicate(
      input.extinguisherId
    );
    if (duplicate) {
      throw new ConflictError(
        "An active (pending) inspection already exists for this extinguisher"
      );
    }

    const data: Prisma.InspectionCreateInput = {
      extinguisher: { connect: { id: input.extinguisherId } },
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      notes: input.notes,
      ...(input.inspectorId
        ? { inspector: { connect: { id: input.inspectorId } } }
        : {}),
    };

    const item = await inspectionRepository.create(data);
    await recordAudit({
      userId: actorId ?? null,
      action: "INSPECTION_SCHEDULED",
      entity: "Inspection",
      entityId: item.id,
      metadata: { extinguisherId: input.extinguisherId },
    });
    return item;
  },

  async update(id: string, input: UpdateInspectionInput, actorId?: string) {
    const existing = await inspectionRepository.findById(id);
    if (!existing) throw new NotFoundError("Inspection not found");

    if (input.scheduledDate || input.scheduledTime) {
      const date = input.scheduledDate ?? existing.scheduledDate;
      const time = input.scheduledTime ?? existing.scheduledTime;
      const scheduled = combineDateTime(date, time);
      if (
        scheduled.getTime() < Date.now() &&
        input.status !== "COMPLETED" &&
        input.status !== "CANCELLED"
      ) {
        throw new BadRequestError("Cannot reschedule an inspection to the past");
      }
    }

    const data: Prisma.InspectionUpdateInput = {
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      status: input.status,
      notes: input.notes,
    };
    if (input.inspectorId === null) {
      data.inspector = { disconnect: true };
    } else if (input.inspectorId) {
      data.inspector = { connect: { id: input.inspectorId } };
    }

    const item = await inspectionRepository.update(id, data);
    await recordAudit({
      userId: actorId ?? null,
      action: "INSPECTION_UPDATED",
      entity: "Inspection",
      entityId: id,
      metadata: { status: item.status },
    });
    return item;
  },

  async remove(id: string, actorId?: string): Promise<void> {
    const existing = await inspectionRepository.findById(id);
    if (!existing) throw new NotFoundError("Inspection not found");
    await inspectionRepository.delete(id);
    await recordAudit({
      userId: actorId ?? null,
      action: "INSPECTION_DELETED",
      entity: "Inspection",
      entityId: id,
    });
  },
};
