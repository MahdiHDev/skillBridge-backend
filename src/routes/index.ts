import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import tutorRoutes from "../modules/tutor/tutor.routes";

const routes: ExpressRouter = Router();

const moduleRoutes = [
    {
        path: "/tutor",
        route: tutorRoutes,
    },
];

moduleRoutes.forEach((route) => routes.use(route.path, route.route));

export default routes;
