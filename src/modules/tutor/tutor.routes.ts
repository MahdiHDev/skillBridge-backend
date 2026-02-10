import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { TutorController } from "./tutor.controller";

const tutorRoutes: ExpressRouter = Router();

tutorRoutes.get(
    "/getAllTutors",
    auth(UserRole.ADMIN),
    TutorController.getAllTutors,
);
tutorRoutes.post(
    "/create",
    auth(UserRole.ADMIN, UserRole.STUDENT),
    TutorController.createTutorProfile,
);

export default tutorRoutes;
