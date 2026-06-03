import type { Request, Response } from "express";
import { maintenanceService } from "./maintenance.service";
import { sendSuccess } from "../../shared/response";

export const maintenanceController = {
  async list(req: Request, res: Response) {
    const { items, pagination } = await maintenanceService.list(
      req.query as never
    );
    return sendSuccess(
      res,
      items,
      "Maintenance records retrieved",
      200,
      pagination
    );
  },

  async getById(req: Request, res: Response) {
    const item = await maintenanceService.getById(req.params.id);
    return sendSuccess(res, item, "Maintenance record retrieved");
  },

  async create(req: Request, res: Response) {
    const item = await maintenanceService.create(req.body, req.user?.id);
    return sendSuccess(res, item, "Maintenance record created", 201);
  },

  async update(req: Request, res: Response) {
    const item = await maintenanceService.update(
      req.params.id,
      req.body,
      req.user?.id
    );
    return sendSuccess(res, item, "Maintenance record updated");
  },

  async remove(req: Request, res: Response) {
    await maintenanceService.remove(req.params.id, req.user?.id);
    return sendSuccess(res, null, "Maintenance record deleted");
  },
};
