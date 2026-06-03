import type { Request, Response } from "express";
import { userService } from "./user.service";
import { sendSuccess } from "../../shared/response";

export const userController = {
  async list(req: Request, res: Response) {
    const { users, pagination } = await userService.list(req.query as never);
    return sendSuccess(res, users, "Users retrieved", 200, pagination);
  },

  async getById(req: Request, res: Response) {
    const user = await userService.getById(req.params.id);
    return sendSuccess(res, user, "User retrieved");
  },

  async create(req: Request, res: Response) {
    const user = await userService.create(req.body, req.user?.id);
    return sendSuccess(res, user, "User created", 201);
  },

  async update(req: Request, res: Response) {
    const user = await userService.update(req.params.id, req.body, req.user?.id);
    return sendSuccess(res, user, "User updated");
  },

  async remove(req: Request, res: Response) {
    await userService.remove(req.params.id, req.user?.id);
    return sendSuccess(res, null, "User deleted");
  },

  async getProfile(req: Request, res: Response) {
    const user = await userService.getById(req.user!.id);
    return sendSuccess(res, user, "Profile retrieved");
  },

  async updateProfile(req: Request, res: Response) {
    const user = await userService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, user, "Profile updated");
  },

  async changePassword(req: Request, res: Response) {
    await userService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    return sendSuccess(res, null, "Password changed successfully");
  },
};
