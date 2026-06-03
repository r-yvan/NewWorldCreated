import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../shared/response";

export const authController = {
  async register(req: Request, res: Response) {
    const { user, tokens } = await authService.register(req.body);
    return sendSuccess(
      res,
      { user, ...tokens },
      "Registration successful",
      201
    );
  },

  async login(req: Request, res: Response) {
    const { user, tokens } = await authService.login(req.body);
    return sendSuccess(res, { user, ...tokens }, "Login successful");
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken, req.user?.id);
    return sendSuccess(res, null, "Logout successful");
  },

  async refresh(req: Request, res: Response) {
    const tokens = await authService.refresh(req.body.refreshToken);
    return sendSuccess(res, tokens, "Token refreshed successfully");
  },

  async me(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.id);
    return sendSuccess(res, user, "Current user retrieved");
  },

  async forgotPassword(req: Request, res: Response) {
    const result = await authService.forgotPassword(req.body.email);
    return sendSuccess(
      res,
      result,
      "If the email exists, a password reset token has been generated"
    );
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    return sendSuccess(res, null, "Password has been reset successfully");
  },
};
