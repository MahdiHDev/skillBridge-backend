import { Router, type Router as ExpressRouter } from "express";

import auth, { UserRole } from "../../middleware/auth";
import { availabilityController } from "./availability.controller";

const availabilityRoutes: ExpressRouter = Router();

availabilityRoutes.post(
    "/create",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    availabilityController.createAvailability,
);

availabilityRoutes.get(
    "/me",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    availabilityController.getOwnAvailability,
);

availabilityRoutes.get(
    "/:tutorId",
    availabilityController.getAvailibilityByTutorId,
);

availabilityRoutes.patch(
    "/update/:slotId",
    auth(UserRole.ADMIN, UserRole.TUTOR),
    availabilityController.updateAvailability,
);

availabilityRoutes.delete(
    "/delete/:slotId",
    auth(UserRole.ADMIN, UserRole.TUTOR),
    availabilityController.deleteAvailability,
);

export default availabilityRoutes;
