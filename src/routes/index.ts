import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import adminRoutes from "../modules/admin/admin.routes";
import availabilityRoutes from "../modules/availability/availability.routes";
import bookingRoutes from "../modules/booking/booking.routes";
import reviewRoutes from "../modules/review/review.routes";
import subjectRoutes from "../modules/subject/subject.routes";
import tutorRoutes from "../modules/tutor/tutor.routes";

const routes: ExpressRouter = Router();

const moduleRoutes = [
    {
        path: "/tutor",
        route: tutorRoutes,
    },
    {
        path: "/availability",
        route: availabilityRoutes,
    },
    {
        path: "/booking",
        route: bookingRoutes,
    },
    {
        path: "/subject",
        route: subjectRoutes,
    },
    {
        path: "/review",
        route: reviewRoutes,
    },
    {
        path: "/admin",
        route: adminRoutes,
    },
];

moduleRoutes.forEach((route) => routes.use(route.path, route.route));

export default routes;
