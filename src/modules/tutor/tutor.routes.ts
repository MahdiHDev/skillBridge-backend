import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import { TutorController } from "./tutor.controller";

const tutorRoutes: ExpressRouter = Router();

tutorRoutes.get("/getAllTutors", TutorController.getAllTutors);

tutorRoutes.get(
    "/getAllTutors/admin",
    auth(UserRole.ADMIN),
    TutorController.getAllTutors,
);

tutorRoutes.get(
    "/getMyProfile",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.getTutorProfileByUserId,
);

tutorRoutes.get("/:tutorProfileId", TutorController.getTutorProfileById);

tutorRoutes.get(
    "/getTeachingSession",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.getTeachingSession,
);

tutorRoutes.post(
    "/create",
    auth(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR),
    TutorController.createTutorProfile,
);

tutorRoutes.post(
    "/createTeachingSession",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.createTeachingSession,
);

tutorRoutes.patch(
    "/approve",
    auth(UserRole.ADMIN),
    TutorController.approveTutorProfile,
);

export default tutorRoutes;
