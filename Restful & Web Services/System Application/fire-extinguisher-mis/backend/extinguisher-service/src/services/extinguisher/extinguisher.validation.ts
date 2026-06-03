import { z } from "zod";
import {
  ExtinguisherType,
  ExtinguisherSize,
  ExtinguisherStatus,
} from "@prisma/client";

const baseFields = {
  serialNumber: z.string().trim().min(1, "Serial number is required"),
  location: z.string().trim().min(1, "Location is required"),
  type: z.nativeEnum(ExtinguisherType),
  size: z.nativeEnum(ExtinguisherSize),
  installationDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
};

export const createExtinguisherSchema = z
  .object({
    ...baseFields,
    status: z.nativeEnum(ExtinguisherStatus).optional(),
  })
  .refine((d) => d.expiryDate > d.installationDate, {
    message: "Expiry date must be after installation date",
    path: ["expiryDate"],
  });

export const updateExtinguisherSchema = z
  .object({
    serialNumber: z.string().trim().min(1).optional(),
    location: z.string().trim().min(1).optional(),
    type: z.nativeEnum(ExtinguisherType).optional(),
    size: z.nativeEnum(ExtinguisherSize).optional(),
    installationDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
    status: z.nativeEnum(ExtinguisherStatus).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  })
  .refine(
    (d) =>
      !(d.installationDate && d.expiryDate) ||
      d.expiryDate > d.installationDate,
    { message: "Expiry date must be after installation date", path: ["expiryDate"] }
  );

export const listExtinguishersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  status: z.nativeEnum(ExtinguisherStatus).optional(),
  type: z.nativeEnum(ExtinguisherType).optional(),
  size: z.nativeEnum(ExtinguisherSize).optional(),
  location: z.string().trim().optional(),
  sortBy: z
    .enum(["createdAt", "expiryDate", "installationDate", "status", "serialNumber"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateExtinguisherInput = z.infer<typeof createExtinguisherSchema>;
export type UpdateExtinguisherInput = z.infer<typeof updateExtinguisherSchema>;
export type ListExtinguishersQuery = z.infer<
  typeof listExtinguishersQuerySchema
>;
