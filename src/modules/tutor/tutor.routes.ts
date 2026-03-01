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

tutorRoutes.get(
    "/getTeachingSession",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.getTeachingSession,
);

tutorRoutes.get("/:tutorProfileId", TutorController.getTutorProfileById);

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

tutorRoutes.put(
    "/updateTutorProfile",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.updateTutorProfile,
);

tutorRoutes.put(
    "/updateTeachingSession/:tutorSessionId",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.updateTeachingSession,
);

tutorRoutes.delete(
    "/deleteTeachingSession/:tutorSessionId",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    TutorController.deleteTeachingSession,
);

export default tutorRoutes;
