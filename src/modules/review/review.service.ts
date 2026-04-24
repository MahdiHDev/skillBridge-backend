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

        const existingReview = await tx.review.findUnique({
            where: {
                bookingId: reviewData.bookingId,
            },
        });

        if (existingReview) {
            throw new Error("You have already reviewed this session");
        }

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

// const getMyReviews = async (studentId: string) => {
//     return prisma.review.findMany({
//         where: { studentId },
//         include: {
//             tutorProfile: true,
//             booking: {},
//         },
//     });
// };

const getMyReviews = async (studentId: string) => {
    return prisma.review.findMany({
        where: { studentId },
        include: {
            tutorProfile: true,
            booking: {
                include: {
                    tutorCategory: {
                        include: {
                            subject: true, // ✅ brings in subject name
                        },
                    },
                },
            },
        },
    });
};

// const deleteReview = async (
//     reviewId: string,
//     role: string,
//     userId: string,
//     targetStudentId?: string, // optional: student to delete for (tutor/admin use)
// ) => {
//     return await prisma.$transaction(async (tx) => {
//         const review = await tx.review.findUnique({
//             where: { id: reviewId },
//             include: {
//                 tutorProfile: true,
//             },
//         });

//         console.log("review", review);

//         if (!review) throw new Error("Review not found");

//         // ✅ ADMIN can delete any review
//         // ✅ TUTOR can only delete reviews on their own profile
//         // ✅ STUDENT can only delete their own reviews
//         if (role === "ADMIN") {
//             // allowed
//         } else if (role === "TUTOR") {
//             // verify review is on tutor's own profile
//             const tutorProfile = await tx.tutorProfile.findUnique({
//                 where: { userId },
//                 select: {
//                     id: true,
//                     userId: true,
//                     tutorProfileId: { select: { id: true } },
//                 },
//             });
//             console.log(tutorProfile);
//             if (!tutorProfile || review.tutorProfileId !== tutorProfile.id) {
//                 throw new Error(
//                     "You can only delete reviews on your own profile",
//                 );
//             }
//             // verify the target student wrote this review
//             if (targetStudentId && review.studentId !== targetStudentId) {
//                 throw new Error("This review was not written by that student");
//             }
//         } else {
//             if (review.studentId !== userId) {
//                 throw new Error("You are not allowed to delete this review");
//             }
//         }

//         await tx.review.delete({ where: { id: reviewId } });

//         const stats = await tx.review.aggregate({
//             where: { tutorProfileId: review.tutorProfileId },
//             _avg: { rating: true },
//             _count: { rating: true },
//         });

//         await tx.tutorProfile.update({
//             where: { id: review.tutorProfileId },
//             data: {
//                 totalReviews: stats._count.rating,
//                 averageRating: stats._avg.rating ?? 0,
//             },
//         });
//     });
// };

const deleteReview = async (
    reviewId: string,
    role: string,
    userId: string,
    targetStudentId?: string,
) => {
    return await prisma.$transaction(async (tx) => {
        const review = await tx.review.findUnique({
            where: { id: reviewId },
            include: {
                tutorProfile: true,
            },
        });

        if (!review) throw new Error("Review not found");

        if (role === "ADMIN") {
            // allowed
        } else if (role === "TUTOR") {
            if (review.studentId === userId) {
                //allowed
            } else {
                const tutorProfile = await tx.tutorProfile.findUnique({
                    where: { userId },
                    select: {
                        id: true,
                        userId: true,
                    },
                });

                if (
                    !tutorProfile ||
                    review.tutorProfileId !== tutorProfile.id
                ) {
                    throw new Error(
                        "You can only delete reviews on your own profile",
                    );
                }

                if (targetStudentId && review.studentId !== targetStudentId) {
                    throw new Error(
                        "This review was not written by that student",
                    );
                }
            }
        } else {
            // STUDENT: studentId on review must match the authenticated userId
            if (review.studentId !== userId) {
                throw new Error("You are not allowed to delete this review");
            }
        }

        await tx.review.delete({ where: { id: reviewId } });

        const stats = await tx.review.aggregate({
            where: { tutorProfileId: review.tutorProfileId },
            _avg: { rating: true },
            _count: { rating: true },
        });

        await tx.tutorProfile.update({
            where: { id: review.tutorProfileId },
            data: {
                totalReviews: stats._count.rating,
                averageRating: stats._avg.rating ?? 0,
            },
        });
    });
};

// service

export const reviewService = {
    createReview,
    getTutorReviews,
    getMyReviews,
    deleteReview,
};
