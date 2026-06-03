import type { Request, Response } from "express";
import { reportingService } from "./reporting.service";
import { sendSuccess } from "../../shared/response";

function buildDownloadUrl(req: Request, fileName: string): string {
  return `${req.protocol}://${req.get("host")}/api/reports/download/${fileName}`;
}

export const reportingController = {
  async dashboard(_req: Request, res: Response) {
    const data = await reportingService.dashboard();
    return sendSuccess(res, data, "Dashboard statistics retrieved");
  },

  async extinguishers(_req: Request, res: Response) {
    const data = await reportingService.extinguisherReport();
    return sendSuccess(res, data, "Extinguisher report retrieved");
  },

  async inspectionStatus(_req: Request, res: Response) {
    const data = await reportingService.inspectionStatusReport();
    return sendSuccess(res, data, "Inspection status report retrieved");
  },

  async expired(_req: Request, res: Response) {
    const data = await reportingService.expiredReport();
    return sendSuccess(res, data, "Expired extinguishers report retrieved");
  },

  async maintenanceHistory(_req: Request, res: Response) {
    const data = await reportingService.maintenanceHistory();
    return sendSuccess(res, data, "Maintenance history retrieved");
  },

  async exportPdf(req: Request, res: Response) {
    const fileName = await reportingService.exportPdf(req.user?.id);
    return sendSuccess(
      res,
      { fileName, downloadUrl: buildDownloadUrl(req, fileName) },
      "PDF report generated"
    );
  },

  async exportCsv(req: Request, res: Response) {
    const fileName = await reportingService.exportCsv(req.user?.id);
    return sendSuccess(
      res,
      { fileName, downloadUrl: buildDownloadUrl(req, fileName) },
      "CSV report generated"
    );
  },
};
