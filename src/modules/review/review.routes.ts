import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import checkUserBanStatus from "../../middleware/checkBanStatus";
import { reviewController } from "./review.controller";

const reviewRoutes: ExpressRouter = Router();

reviewRoutes.post(
    "/create",
    auth(UserRole.STUDENT, UserRole.ADMIN),
    checkUserBanStatus,
    reviewController.createReview,
);

reviewRoutes.get(
    "/my",
    auth(UserRole.STUDENT, UserRole.ADMIN),
    reviewController.getMyReviews,
);

reviewRoutes.get(
    "/:tutorProfileId",
    reviewController.getReviewsByTutorProfileId,
);

export default reviewRoutes;
