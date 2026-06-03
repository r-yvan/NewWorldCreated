import { Router } from "express";
import { Role } from "@prisma/client";
import { inspectionController } from "./inspection.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../shared/asyncHandler";
import { uuidParamSchema } from "../../shared/validation";
import {
  createInspectionSchema,
  updateInspectionSchema,
  listInspectionsQuerySchema,
} from "./inspection.validation";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/inspections:
 *   get:
 *     tags: [Inspections]
 *     summary: List inspections (with history filtering)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: status, schema: { type: string, enum: [PENDING, COMPLETED, OVERDUE, CANCELLED] } }
 *       - { in: query, name: extinguisherId, schema: { type: string, format: uuid } }
 *       - { in: query, name: inspectorId, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Inspections retrieved }
 *   post:
 *     tags: [Inspections]
 *     summary: Schedule an inspection
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [extinguisherId, scheduledDate, scheduledTime]
 *             properties:
 *               extinguisherId: { type: string, format: uuid }
 *               scheduledDate: { type: string, format: date, example: 2026-06-01 }
 *               scheduledTime: { type: string, example: "14:30" }
 *               inspectorId: { type: string, format: uuid }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Inspection scheduled }
 *       400: { description: Cannot schedule in the past }
 *       409: { description: Duplicate active inspection }
 */
router.get(
  "/",
  validate({ query: listInspectionsQuerySchema }),
  asyncHandler(inspectionController.list)
);
router.post(
  "/",
  validate({ body: createInspectionSchema }),
  asyncHandler(inspectionController.create)
);

/**
 * @openapi
 * /api/inspections/{id}:
 *   get:
 *     tags: [Inspections]
 *     summary: Get an inspection by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Inspection retrieved }
 *   put:
 *     tags: [Inspections]
 *     summary: Update an inspection / change its status (INSPECTOR or ADMIN)
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
 *               status: { type: string, enum: [PENDING, COMPLETED, OVERDUE, CANCELLED] }
 *               notes: { type: string }
 *               inspectorId: { type: string, format: uuid }
 *     responses:
 *       200: { description: Inspection updated }
 *   delete:
 *     tags: [Inspections]
 *     summary: Delete an inspection (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Inspection deleted }
 */
router.get(
  "/:id",
  validate({ params: uuidParamSchema }),
  asyncHandler(inspectionController.getById)
);
router.put(
  "/:id",
  authorize(Role.INSPECTOR, Role.ADMIN),
  validate({ params: uuidParamSchema, body: updateInspectionSchema }),
  asyncHandler(inspectionController.update)
);
router.delete(
  "/:id",
  authorize(Role.ADMIN),
  validate({ params: uuidParamSchema }),
  asyncHandler(inspectionController.remove)
);

export default router;
