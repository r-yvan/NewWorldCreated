import path from "path";
import fs from "fs";
import { Router } from "express";
import { Role } from "@prisma/client";
import { reportingController } from "./reporting.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { asyncHandler } from "../../shared/asyncHandler";
import { getExportDir } from "../../shared/export";
import { NotFoundError, BadRequestError } from "../../shared/errors";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/reports/dashboard:
 *   get:
 *     tags: [Reports]
 *     summary: Dashboard statistics (ADMIN, INSPECTOR)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard statistics retrieved }
 */
router.get(
  "/dashboard",
  authorize(Role.ADMIN, Role.INSPECTOR),
  asyncHandler(reportingController.dashboard)
);

/**
 * @openapi
 * /api/reports/extinguishers:
 *   get:
 *     tags: [Reports]
 *     summary: Extinguisher totals (daily/monthly/yearly) and status breakdown
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Extinguisher report retrieved }
 */
router.get(
  "/extinguishers",
  authorize(Role.ADMIN, Role.INSPECTOR),
  asyncHandler(reportingController.extinguishers)
);

/**
 * @openapi
 * /api/reports/inspection-status:
 *   get:
 *     tags: [Reports]
 *     summary: Inspection status report (pending/completed/overdue)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Inspection status report retrieved }
 */
router.get(
  "/inspection-status",
  authorize(Role.ADMIN, Role.INSPECTOR),
  asyncHandler(reportingController.inspectionStatus)
);

/**
 * @openapi
 * /api/reports/expired:
 *   get:
 *     tags: [Reports]
 *     summary: List all expired extinguishers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Expired extinguishers report retrieved }
 */
router.get(
  "/expired",
  authorize(Role.ADMIN, Role.INSPECTOR),
  asyncHandler(reportingController.expired)
);

/**
 * @openapi
 * /api/reports/maintenance-history:
 *   get:
 *     tags: [Reports]
 *     summary: Maintenance history grouped by extinguisher
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Maintenance history retrieved }
 */
router.get(
  "/maintenance-history",
  authorize(Role.ADMIN, Role.INSPECTOR),
  asyncHandler(reportingController.maintenanceHistory)
);

/**
 * @openapi
 * /api/reports/export/pdf:
 *   get:
 *     tags: [Reports]
 *     summary: Generate a PDF compliance report and return a download URL
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: PDF report generated }
 */
router.get(
  "/export/pdf",
  authorize(Role.ADMIN, Role.INSPECTOR),
  asyncHandler(reportingController.exportPdf)
);

/**
 * @openapi
 * /api/reports/export/csv:
 *   get:
 *     tags: [Reports]
 *     summary: Generate a CSV extinguisher report and return a download URL
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CSV report generated }
 */
router.get(
  "/export/csv",
  authorize(Role.ADMIN, Role.INSPECTOR),
  asyncHandler(reportingController.exportCsv)
);

/**
 * @openapi
 * /api/reports/download/{fileName}:
 *   get:
 *     tags: [Reports]
 *     summary: Download a previously generated report file
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: fileName, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: File stream }
 *       404: { description: File not found }
 */
router.get(
  "/download/:fileName",
  authorize(Role.ADMIN, Role.INSPECTOR),
  asyncHandler(async (req, res) => {
    const fileName = req.params.fileName;
    // Prevent path traversal: only allow a bare file name.
    if (fileName.includes("/") || fileName.includes("..")) {
      throw new BadRequestError("Invalid file name");
    }
    const filePath = path.join(getExportDir(), fileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("Report file not found");
    }
    res.download(filePath);
  })
);

export default router;
