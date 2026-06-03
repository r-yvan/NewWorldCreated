import { z } from "zod";
import { InspectionStatus } from "@prisma/client";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createInspectionSchema = z.object({
  extinguisherId: z.string().uuid("Invalid extinguisher id"),
  scheduledDate: z.coerce.date(),
  scheduledTime: z
    .string()
    .regex(timeRegex, "scheduledTime must be in HH:mm 24-hour format"),
  inspectorId: z.string().uuid("Invalid inspector id").optional(),
  notes: z.string().trim().optional(),
});

export const updateInspectionSchema = z
  .object({
    scheduledDate: z.coerce.date().optional(),
    scheduledTime: z.string().regex(timeRegex).optional(),
    inspectorId: z.string().uuid().nullable().optional(),
    status: z.nativeEnum(InspectionStatus).optional(),
    notes: z.string().trim().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

export const listInspectionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: z.nativeEnum(InspectionStatus).optional(),
  extinguisherId: z.string().uuid().optional(),
  inspectorId: z.string().uuid().optional(),
  sortBy: z
    .enum(["createdAt", "scheduledDate", "status"])
    .optional()
    .default("scheduledDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;
export type ListInspectionsQuery = z.infer<typeof listInspectionsQuerySchema>;
