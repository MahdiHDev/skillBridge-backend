import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import availabilityRoutes from "../modules/availability/availability.routes";
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
];

moduleRoutes.forEach((route) => routes.use(route.path, route.route));

export default routes;
