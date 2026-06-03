import { Router } from "express";
import { Role } from "@prisma/client";
import { extinguisherController } from "./extinguisher.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../shared/asyncHandler";
import { uuidParamSchema } from "../../shared/validation";
import {
  createExtinguisherSchema,
  updateExtinguisherSchema,
  listExtinguishersQuerySchema,
} from "./extinguisher.validation";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/extinguishers:
 *   get:
 *     tags: [Extinguishers]
 *     summary: List extinguishers with pagination, search, filtering and sorting
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: search, schema: { type: string }, description: "Matches serial number or location" }
 *       - { in: query, name: status, schema: { type: string, enum: [ACTIVE, EXPIRED, UNDER_MAINTENANCE, INSPECTION_DUE, OUT_OF_SERVICE] } }
 *       - { in: query, name: type, schema: { type: string, enum: [WATER, CO2, FOAM, DRY_CHEMICAL] } }
 *       - { in: query, name: location, schema: { type: string } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [createdAt, expiryDate, installationDate, status, serialNumber] } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc] } }
 *     responses:
 *       200: { description: Extinguishers retrieved }
 *   post:
 *     tags: [Extinguishers]
 *     summary: Register a new extinguisher (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serialNumber, location, type, size, installationDate, expiryDate]
 *             properties:
 *               serialNumber: { type: string, example: FE-0001 }
 *               location: { type: string, example: Warehouse A - Floor 1 }
 *               type: { type: string, enum: [WATER, CO2, FOAM, DRY_CHEMICAL] }
 *               size: { type: string, enum: [SIZE_2_5_LBS, SIZE_5_LBS, SIZE_9_LBS, SIZE_12_LBS] }
 *               installationDate: { type: string, format: date, example: 2024-01-15 }
 *               expiryDate: { type: string, format: date, example: 2026-01-15 }
 *     responses:
 *       201: { description: Extinguisher created }
 *       409: { description: Serial number already exists }
 */
router.get(
  "/",
  validate({ query: listExtinguishersQuerySchema }),
  asyncHandler(extinguisherController.list)
);
router.post(
  "/",
  authorize(Role.ADMIN),
  validate({ body: createExtinguisherSchema }),
  asyncHandler(extinguisherController.create)
);

/**
 * @openapi
 * /api/extinguishers/{id}:
 *   get:
 *     tags: [Extinguishers]
 *     summary: Get an extinguisher by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Extinguisher retrieved }
 *       404: { description: Not found }
 *   put:
 *     tags: [Extinguishers]
 *     summary: Update an extinguisher (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location: { type: string }
 *               status: { type: string, enum: [ACTIVE, EXPIRED, UNDER_MAINTENANCE, INSPECTION_DUE, OUT_OF_SERVICE] }
 *               expiryDate: { type: string, format: date }
 *     responses:
 *       200: { description: Extinguisher updated }
 *   delete:
 *     tags: [Extinguishers]
 *     summary: Delete an extinguisher (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Extinguisher deleted }
 */
router.get(
  "/:id",
  validate({ params: uuidParamSchema }),
  asyncHandler(extinguisherController.getById)
);
router.put(
  "/:id",
  authorize(Role.ADMIN),
  validate({ params: uuidParamSchema, body: updateExtinguisherSchema }),
  asyncHandler(extinguisherController.update)
);
router.delete(
  "/:id",
  authorize(Role.ADMIN),
  validate({ params: uuidParamSchema }),
  asyncHandler(extinguisherController.remove)
);

export default router;
