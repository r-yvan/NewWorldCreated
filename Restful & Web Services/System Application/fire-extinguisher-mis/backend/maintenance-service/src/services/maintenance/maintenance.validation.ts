import { z } from "zod";

export const createMaintenanceSchema = z.object({
  extinguisherId: z.string().uuid("Invalid extinguisher id"),
  inspectorId: z.string().uuid("Invalid inspector id").optional(),
  actionTaken: z.string().trim().min(1, "Action taken is required"),
  conditionNotes: z.string().trim().min(1, "Condition notes are required"),
  maintenanceDate: z.coerce.date(),
});

export const updateMaintenanceSchema = z
  .object({
    actionTaken: z.string().trim().min(1).optional(),
    conditionNotes: z.string().trim().min(1).optional(),
    maintenanceDate: z.coerce.date().optional(),
    inspectorId: z.string().uuid().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

export const listMaintenanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  extinguisherId: z.string().uuid().optional(),
  inspectorId: z.string().uuid().optional(),
  sortBy: z
    .enum(["createdAt", "maintenanceDate"])
    .optional()
    .default("maintenanceDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type ListMaintenanceQuery = z.infer<typeof listMaintenanceQuerySchema>;
