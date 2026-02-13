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

tutorRoutes.get(
    "/getMyProfile",
    auth(UserRole.TUTOR),
    TutorController.getTutorProfileByUserId,
);

tutorRoutes.post(
    "/create",
    auth(UserRole.ADMIN, UserRole.STUDENT),
    TutorController.createTutorProfile,
);

tutorRoutes.patch(
    "/approve",
    auth(UserRole.ADMIN),
    TutorController.approveTutorProfile,
);

export default tutorRoutes;
