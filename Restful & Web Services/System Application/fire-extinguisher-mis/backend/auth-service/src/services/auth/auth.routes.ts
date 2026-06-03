import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../shared/asyncHandler";
import { authRateLimiter } from "../../middleware/rateLimit";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, example: John }
 *               lastName: { type: string, example: Doe }
 *               email: { type: string, example: john.doe@example.com }
 *               password: { type: string, example: StrongP@ss1 }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email already exists }
 */
router.post(
  "/register",
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register)
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@tzw.com }
 *               password: { type: string, example: Admin@123 }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login)
);

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new token pair
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Token refreshed }
 *       401: { description: Invalid refresh token }
 */
router.post(
  "/refresh-token",
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refresh)
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke a refresh token
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Logout successful }
 */
router.post(
  "/logout",
  authenticate,
  validate({ body: logoutSchema }),
  asyncHandler(authController.logout)
);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: admin@tzw.com }
 *     responses:
 *       200: { description: Reset token generated if email exists }
 */
router.post(
  "/forgot-password",
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using a reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, example: NewStr0ng@Pass }
 *     responses:
 *       200: { description: Password reset successful }
 *       400: { description: Invalid or expired token }
 */
router.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword)
);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user retrieved }
 *       401: { description: Unauthorized }
 */
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
