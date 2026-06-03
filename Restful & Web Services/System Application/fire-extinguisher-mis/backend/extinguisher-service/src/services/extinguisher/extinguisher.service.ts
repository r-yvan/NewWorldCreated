import type { Extinguisher, Prisma } from "@prisma/client";
import { extinguisherRepository } from "./extinguisher.repository";
import { getPagination, buildPaginationMeta } from "../../shared/pagination";
import type { PaginationMeta } from "../../shared/response";
import { ConflictError, NotFoundError } from "../../shared/errors";
import { recordAudit } from "../../shared/audit";
import { resolveExtinguisherStatus } from "../../utils/extinguisher-status";
import type {
  CreateExtinguisherInput,
  ListExtinguishersQuery,
  UpdateExtinguisherInput,
} from "./extinguisher.validation";

export const extinguisherService = {
  async list(
    query: ListExtinguishersQuery
  ): Promise<{ items: Extinguisher[]; pagination: PaginationMeta }> {
    const { page, limit, skip } = getPagination(query.page, query.limit);

    const where: Prisma.ExtinguisherWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.size) where.size = query.size;
    if (query.location)
      where.location = { contains: query.location, mode: "insensitive" };
    if (query.search) {
      where.OR = [
        { serialNumber: { contains: query.search, mode: "insensitive" } },
        { location: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      extinguisherRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      extinguisherRepository.count(where),
    ]);

    return { items, pagination: buildPaginationMeta(total, page, limit) };
  },

  async getById(id: string): Promise<Extinguisher> {
    const item = await extinguisherRepository.findById(id);
    if (!item) throw new NotFoundError("Extinguisher not found");
    return item;
  },

  async create(
    input: CreateExtinguisherInput,
    actorId?: string
  ): Promise<Extinguisher> {
    const existing = await extinguisherRepository.findBySerial(
      input.serialNumber
    );
    if (existing) throw new ConflictError("Serial number already exists");

    const status = resolveExtinguisherStatus(input.expiryDate, input.status);
    const item = await extinguisherRepository.create({ ...input, status });
    await recordAudit({
      userId: actorId ?? null,
      action: "EXTINGUISHER_CREATED",
      entity: "Extinguisher",
      entityId: item.id,
      metadata: { serialNumber: item.serialNumber },
    });
    return item;
  },

  async update(
    id: string,
    input: UpdateExtinguisherInput,
    actorId?: string
  ): Promise<Extinguisher> {
    const existing = await extinguisherRepository.findById(id);
    if (!existing) throw new NotFoundError("Extinguisher not found");

    if (input.serialNumber && input.serialNumber !== existing.serialNumber) {
      const taken = await extinguisherRepository.findBySerial(
        input.serialNumber
      );
      if (taken) throw new ConflictError("Serial number already exists");
    }

    const expiryDate = input.expiryDate ?? existing.expiryDate;
    const status = resolveExtinguisherStatus(
      expiryDate,
      input.status ?? existing.status
    );

    const item = await extinguisherRepository.update(id, { ...input, status });
    await recordAudit({
      userId: actorId ?? null,
      action: "EXTINGUISHER_UPDATED",
      entity: "Extinguisher",
      entityId: id,
      metadata: { before: existing, after: item },
    });
    return item;
  },

  async remove(id: string, actorId?: string): Promise<void> {
    const existing = await extinguisherRepository.findById(id);
    if (!existing) throw new NotFoundError("Extinguisher not found");
    await extinguisherRepository.delete(id);
    await recordAudit({
      userId: actorId ?? null,
      action: "EXTINGUISHER_DELETED",
      entity: "Extinguisher",
      entityId: id,
      metadata: { serialNumber: existing.serialNumber },
    });
  },
};
