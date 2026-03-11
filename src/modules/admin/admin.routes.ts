import { Router, type Router as ExpressRouter } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { adminController } from "./admin.controller";

const adminRoutes: ExpressRouter = Router();

adminRoutes.get("/users", adminController.getAllUsers);

adminRoutes.patch(
    "/users/:id/status",
    auth(UserRole.ADMIN),
    adminController.updateUserStatus,
);

export default adminRoutes;
