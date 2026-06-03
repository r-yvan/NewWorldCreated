import { Router } from "express";
import { Role } from "@prisma/client";
import { userController } from "./user.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../shared/asyncHandler";
import { uuidParamSchema } from "../../shared/validation";
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  listUsersQuerySchema,
} from "./user.validation";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile retrieved }
 *   put:
 *     tags: [Users]
 *     summary: Update the authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.get("/profile", asyncHandler(userController.getProfile));
router.put(
  "/profile",
  validate({ body: updateProfileSchema }),
  asyncHandler(userController.updateProfile)
);

/**
 * @openapi
 * /api/users/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change the authenticated user's password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, example: NewStr0ng@Pass }
 *     responses:
 *       200: { description: Password changed }
 *       400: { description: Current password incorrect }
 */
router.put(
  "/change-password",
  validate({ body: changePasswordSchema }),
  asyncHandler(userController.changePassword)
);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: role, schema: { type: string, enum: [ADMIN, INSPECTOR, USER] } }
 *       - { in: query, name: isActive, schema: { type: boolean } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [createdAt, firstName, lastName, email, role] } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc] } }
 *     responses:
 *       200: { description: Users retrieved }
 *   post:
 *     tags: [Users]
 *     summary: Create a user (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               password: { type: string, example: StrongP@ss1 }
 *               role: { type: string, enum: [ADMIN, INSPECTOR, USER] }
 *               isActive: { type: boolean }
 *     responses:
 *       201: { description: User created }
 */
router.get(
  "/",
  authorize(Role.ADMIN),
  validate({ query: listUsersQuerySchema }),
  asyncHandler(userController.list)
);
router.post(
  "/",
  authorize(Role.ADMIN),
  validate({ body: createUserSchema }),
  asyncHandler(userController.create)
);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by id (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: User retrieved }
 *       404: { description: Not found }
 *   put:
 *     tags: [Users]
 *     summary: Update a user (ADMIN only)
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               role: { type: string, enum: [ADMIN, INSPECTOR, USER] }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: User updated }
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user (ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: User deleted }
 */
router.get(
  "/:id",
  authorize(Role.ADMIN),
  validate({ params: uuidParamSchema }),
  asyncHandler(userController.getById)
);
router.put(
  "/:id",
  authorize(Role.ADMIN),
  validate({ params: uuidParamSchema, body: updateUserSchema }),
  asyncHandler(userController.update)
);
router.delete(
  "/:id",
  authorize(Role.ADMIN),
  validate({ params: uuidParamSchema }),
  asyncHandler(userController.remove)
);

export default router;
