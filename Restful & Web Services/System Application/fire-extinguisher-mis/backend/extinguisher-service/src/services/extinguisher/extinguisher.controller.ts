import type { Request, Response } from "express";
import { extinguisherService } from "./extinguisher.service";
import { sendSuccess } from "../../shared/response";

export const extinguisherController = {
  async list(req: Request, res: Response) {
    const { items, pagination } = await extinguisherService.list(
      req.query as never
    );
    return sendSuccess(res, items, "Extinguishers retrieved", 200, pagination);
  },

  async getById(req: Request, res: Response) {
    const item = await extinguisherService.getById(req.params.id);
    return sendSuccess(res, item, "Extinguisher retrieved");
  },

  async create(req: Request, res: Response) {
    const item = await extinguisherService.create(req.body, req.user?.id);
    return sendSuccess(res, item, "Extinguisher created", 201);
  },

  async update(req: Request, res: Response) {
    const item = await extinguisherService.update(
      req.params.id,
      req.body,
      req.user?.id
    );
    return sendSuccess(res, item, "Extinguisher updated");
  },

  async remove(req: Request, res: Response) {
    await extinguisherService.remove(req.params.id, req.user?.id);
    return sendSuccess(res, null, "Extinguisher deleted");
  },
};
