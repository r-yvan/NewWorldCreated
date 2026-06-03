import { Router } from "express";
import { Role } from "@prisma/client";
import { maintenanceController } from "./maintenance.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../shared/asyncHandler";
import { uuidParamSchema } from "../../shared/validation";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  listMaintenanceQuerySchema,
} from "./maintenance.validation";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/maintenance:
 *   get:
 *     tags: [Maintenance]
 *     summary: List maintenance records
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: extinguisherId, schema: { type: string, format: uuid } }
 *       - { in: query, name: inspectorId, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Maintenance records retrieved }
 *   post:
 *     tags: [Maintenance]
 *     summary: Create a maintenance log (INSPECTOR or ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [extinguisherId, actionTaken, conditionNotes, maintenanceDate]
 *             properties:
 *               extinguisherId: { type: string, format: uuid }
 *               actionTaken: { type: string, example: Replaced pressure gauge }
 *               conditionNotes: { type: string, example: Unit in good condition }
 *               maintenanceDate: { type: string, format: date }
 *               inspectorId: { type: string, format: uuid }
 *     responses:
 *       201: { description: Maintenance record created }
 *       403: { description: Forbidden }
 */
router.get(
  "/",
  validate({ query: listMaintenanceQuerySchema }),
  asyncHandler(maintenanceController.list)
);
router.post(
  "/",
  authorize(Role.INSPECTOR, Role.ADMIN),
  validate({ body: createMaintenanceSchema }),
  asyncHandler(maintenanceController.create)
);

/**
 * @openapi
 * /api/maintenance/{id}:
 *   get:
 *     tags: [Maintenance]
 *     summary: Get a maintenance record by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Maintenance record retrieved }
 *   put:
 *     tags: [Maintenance]
 *     summary: Update a maintenance record (INSPECTOR or ADMIN only)
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
 *               actionTaken: { type: string }
 *               conditionNotes: { type: string }
 *               maintenanceDate: { type: string, format: date }
 *     responses:
 *       200: { description: Maintenance record updated }
 *   delete:
 *     tags: [Maintenance]
 *     summary: Delete a maintenance record (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Maintenance record deleted }
 */
router.get(
  "/:id",
  validate({ params: uuidParamSchema }),
  asyncHandler(maintenanceController.getById)
);
router.put(
  "/:id",
  authorize(Role.INSPECTOR, Role.ADMIN),
  validate({ params: uuidParamSchema, body: updateMaintenanceSchema }),
  asyncHandler(maintenanceController.update)
);
router.delete(
  "/:id",
  authorize(Role.ADMIN),
  validate({ params: uuidParamSchema }),
  asyncHandler(maintenanceController.remove)
);

export default router;
