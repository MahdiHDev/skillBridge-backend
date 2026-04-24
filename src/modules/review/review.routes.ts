import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import auth, { UserRole } from "../../middleware/auth";
import checkUserBanStatus from "../../middleware/checkBanStatus";
import { reviewController } from "./review.controller";

const reviewRoutes: ExpressRouter = Router();

reviewRoutes.post(
    "/create",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    reviewController.createReview,
);

reviewRoutes.get(
    "/my",
    auth(UserRole.STUDENT, UserRole.ADMIN, UserRole.TUTOR),
    reviewController.getMyReviews,
);

reviewRoutes.get(
    "/:tutorProfileId",
    reviewController.getReviewsByTutorProfileId,
);

reviewRoutes.delete(
    "/:reviewId/",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    checkUserBanStatus,
    reviewController.deleteReview,
);

export default reviewRoutes;
