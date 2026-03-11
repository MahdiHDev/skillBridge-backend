import { NextFunction, Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { bookingId, rating, comment } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const studentId = user?.id as string;

    try {
        const result = await reviewService.createReview(studentId, {
            bookingId,
            rating,
            comment,
        });
        res.status(200).json({
            success: true,
            message: "Review Created Successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getReviewsByTutorProfileId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { tutorProfileId } = req.params;

        if (!tutorProfileId) {
            return res.status(400).json({
                success: false,
                message: "Tutor Profile ID is required",
            });
        }

        const result = await reviewService.getTutorReviews(
            tutorProfileId as string,
        );
        res.status(200).json({
            success: true,
            message: "Reviews retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMyReviews = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const studentId = user?.id as string;

        const result = await reviewService.getMyReviews(studentId);

        res.status(200).json({
            success: true,
            message: "My reviews retrived successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const reviewController = {
    createReview,
    getReviewsByTutorProfileId,
    getMyReviews,
};
