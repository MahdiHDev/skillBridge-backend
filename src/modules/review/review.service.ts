import { prisma } from "../../lib/prisma";

const createReview = async (
    studentId: string,
    reviewData: { bookingId: string; rating: number; comment: string },
) => {
    return await prisma.$transaction(async (tx) => {
        // checking booking exists or not
        const booking = await tx.booking.findUnique({
            where: { id: reviewData.bookingId },
            include: {
                tutorCategory: {
                    include: { tutorProfile: true },
                },
            },
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking?.studentId !== studentId) {
            throw new Error("You are not allowed to review this booking");
        }

        if (booking.status !== "COMPLETED") {
            throw new Error("You can only review completed sessions");
        }

        const tutorProfileId = booking.tutorCategory.tutorProfileId;

        const review = await tx.review.create({
            data: {
                bookingId: reviewData.bookingId,
                studentId,
                tutorProfileId,
                rating: reviewData.rating,
                comment: reviewData.comment,
            },
        });

        // 5️⃣ Aggregate tutor reviews
        const stats = await tx.review.aggregate({
            where: { tutorProfileId },
            _avg: {
                rating: true,
            },
            _count: {
                rating: true,
            },
        });

        // 6️⃣ Update tutor profile rating
        await tx.tutorProfile.update({
            where: { id: tutorProfileId },
            data: {
                totalReviews: stats._count.rating,
                averageRating: stats._avg.rating ?? 0,
            },
        });

        // return review with relations
        const reviewWithRelations = await tx.review.findUnique({
            where: { id: review.id },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tutorProfile: true,
                booking: true,
            },
        });

        return reviewWithRelations;
    });
};

const getTutorReviews = async (tutorProfileId: string) => {
    return await prisma.review.findMany({
        where: { tutorProfileId },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

const getMyReviews = async (studentId: string) => {
    return prisma.review.findMany({
        where: { studentId },
        include: {
            tutorProfile: true,
            booking: true,
        },
    });
};

export const reviewService = {
    createReview,
    getTutorReviews,
    getMyReviews,
};
