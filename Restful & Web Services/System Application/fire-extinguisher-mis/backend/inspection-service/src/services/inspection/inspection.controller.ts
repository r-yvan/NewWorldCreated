import type { Request, Response } from "express";
import { inspectionService } from "./inspection.service";
import { sendSuccess } from "../../shared/response";

export const inspectionController = {
  async list(req: Request, res: Response) {
    const { items, pagination } = await inspectionService.list(
      req.query as never
    );
    return sendSuccess(res, items, "Inspections retrieved", 200, pagination);
  },

  async getById(req: Request, res: Response) {
    const item = await inspectionService.getById(req.params.id);
    return sendSuccess(res, item, "Inspection retrieved");
  },

  async create(req: Request, res: Response) {
    const item = await inspectionService.create(req.body, req.user?.id);
    return sendSuccess(res, item, "Inspection scheduled", 201);
  },

  async update(req: Request, res: Response) {
    const item = await inspectionService.update(
      req.params.id,
      req.body,
      req.user?.id
    );
    return sendSuccess(res, item, "Inspection updated");
  },

  async remove(req: Request, res: Response) {
    await inspectionService.remove(req.params.id, req.user?.id);
    return sendSuccess(res, null, "Inspection deleted");
  },
};
