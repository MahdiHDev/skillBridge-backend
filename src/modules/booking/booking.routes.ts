import { Router, type Router as ExpressRouter } from "express";
import auth, { UserRole } from "../../middleware/auth";
import checkUserBanStatus from "../../middleware/checkBanStatus";
import { bookingController } from "./booking.controller";

const bookingRoutes: ExpressRouter = Router();

bookingRoutes.post(
    "/create",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    bookingController.createBooking,
);

bookingRoutes.get(
    "/my-sessions",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    bookingController.mySessions,
);
bookingRoutes.get(
    "/upcoming",
    auth(UserRole.STUDENT, UserRole.ADMIN, UserRole.TUTOR),
    bookingController.upcomingSession,
);

bookingRoutes.get(
    "/teaching",
    auth(UserRole.TUTOR, UserRole.ADMIN),
    bookingController.teachingSession,
);

bookingRoutes.get(
    "/getAllBooking",
    auth(UserRole.ADMIN),
    bookingController.getAllBooking,
);

bookingRoutes.patch(
    "/:id/status",
    auth(UserRole.ADMIN, UserRole.TUTOR),
    bookingController.bookingStatus,
);

export default bookingRoutes;
