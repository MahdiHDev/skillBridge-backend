import { BookingStatus } from "../../../generated/prisma/enums";
import { BookingWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

type getAllBookingOptions = {
    subjectSlug: string | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    startDate?: string;
    endDate?: string;
    studentId: string | undefined;
    tutorId: string | undefined;

    status: BookingStatus | undefined;

    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
};

type getAllTeachingSessionOptions = {
    status: BookingStatus | undefined;
    startDate?: string;
    endDate?: string;

    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
};

const createBooking = async (
    studentId: string,
    data: {
        tutorCategoryId: string;
        sessionDate: string;
        startTime: string;
        endTime: string;
    },
) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!data.sessionDate) {
        throw new Error("Session date is required");
    }

    const sessionDate = new Date(`${data.sessionDate}T00:00:00.000`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
        throw new Error("Session date cannot be in the past");
    }

    if (!data.startTime || !data.endTime) {
        throw new Error("Start time and end time are required");
    }
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
        throw new Error("Invalid time format. Use HH:MM");
    }

    const startTime = new Date(`1970-01-01T${data.startTime}:00`);
    const endTime = new Date(`1970-01-01T${data.endTime}:00`);

    if (startTime >= endTime) {
        throw new Error("Start time must be before end time");
    }

    if (!data.tutorCategoryId) {
        throw new Error("Tutor category is required");
    }

    return await prisma.$transaction(
        async (tx) => {
            // get tutor category
            const tutorCategory = await tx.tutorCategory.findUnique({
                where: { id: data.tutorCategoryId },
                include: { tutorProfile: true },
            });

            if (!tutorCategory) {
                throw new Error("Tutor Category not found");
            }

            const tutorProfileId = tutorCategory.tutorProfileId;

            if (tutorCategory.tutorProfile.status !== "APPROVED") {
                throw new Error("Tutor is not approved");
            }

            // check availability for this date
            const dayOfWeek = await sessionDate
                .toLocaleDateString("en-US", {
                    weekday: "short",
                })
                .toUpperCase();

            const availability = await tx.availabilitySlot.findFirst({
                where: {
                    tutorProfileId,
                    dayOfWeek: dayOfWeek as any,
                    isActive: true,
                    startDate: { lte: sessionDate },
                    endDate: { gte: sessionDate },
                    startTime: { lte: startTime },
                    endTime: { gte: endTime },
                },
            });

            if (!availability) {
                throw new Error("Selected time is not available");
            }

            // prevent overlapping booking
            const overLappingBooking = await tx.booking.findFirst({
                where: {
                    tutorCategoryId: data.tutorCategoryId,
                    sessionDate: sessionDate,
                    status: { in: ["PENDING", "CONFIRMED"] },
                    startTime: { lt: endTime },
                    endTime: { gt: startTime },
                },
            });

            if (overLappingBooking) {
                throw new Error("This time slot is already booked");
            }

            // calculation duration
            const durationInMs = endTime.getTime() - startTime.getTime();
            const durationInHours = durationInMs / (1000 * 60 * 60);

            const totalPrice = Number(
                tutorCategory.hourlyRate * durationInHours,
            ).toFixed(2);

            // create booking
            const booking = await tx.booking.create({
                data: {
                    studentId,
                    tutorCategoryId: data.tutorCategoryId,
                    sessionDate,
                    startTime,
                    endTime,
                    price: parseFloat(totalPrice),
                    status: "PENDING",
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            return booking;
        },
        {
            timeout: 15000,
        },
    );
};

const mySessions = async (studentId: string) => {
    return await prisma.booking.findMany({
        where: { studentId },
        include: {
            tutorCategory: {
                include: {
                    subject: true,
                    tutorProfile: {
                        select: {
                            id: true,
                            userId: true,
                            bio: true,
                            totalReviews: true,
                            averageRating: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

const upCommingSession = async () => {
    const today = new Date();
    return await prisma.booking.findMany({
        where: {
            sessionDate: {
                gte: today,
            },
            status: "CONFIRMED",
        },
        include: {
            tutorCategory: {
                include: {
                    tutorProfile: true,
                    subject: true,
                },
            },
        },
    });
};

const teachingSession = async (
    userId: string,
    {
        status,
        startDate,
        endDate,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    }: getAllTeachingSessionOptions,
) => {
    const andConditions: BookingWhereInput[] = [];

    if (status) {
        andConditions.push({
            status,
        });
    }

    if (startDate || endDate) {
        andConditions.push({
            sessionDate: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
            },
        });
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    const booking = await prisma.booking.findMany({
        take: limit,
        skip,
        where: {
            tutorCategory: {
                tutorProfileId: tutorProfile.id,
            },
            AND: andConditions,
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            tutorCategory: {
                include: {
                    subject: true,
                },
            },
        },
        orderBy: {
            [sortBy]: sortOrder,
        },
    });

    const total = await prisma.booking.count({
        where: {
            tutorCategory: {
                tutorProfileId: tutorProfile.id,
            },
            AND: andConditions,
        },
    });

    return {
        data: booking,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getAllBooking = async ({
    status,
    studentId,
    tutorId,
    subjectSlug,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
}: getAllBookingOptions) => {
    const andConditions: BookingWhereInput[] = [];

    if (status) {
        andConditions.push({
            status,
        });
    }

    if (studentId) {
        andConditions.push({
            studentId,
        });
    }

    if (tutorId) {
        andConditions.push({
            tutorCategory: {
                tutorProfileId: tutorId,
            },
        });
    }

    if (subjectSlug) {
        andConditions.push({
            tutorCategory: {
                subject: {
                    slug: subjectSlug,
                },
            },
        });
    }

    if (startDate || endDate) {
        andConditions.push({
            sessionDate: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
            },
        });
    }

    if (minPrice || maxPrice) {
        andConditions.push({
            price: {
                gte: minPrice ?? 0,
                lte: maxPrice ?? 999999,
            },
        });
    }

    const booking = await prisma.booking.findMany({
        take: limit,
        skip,
        where: {
            AND: andConditions,
        },
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            student: true,
            tutorCategory: {
                include: {
                    subject: true,
                    tutorProfile: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    });

    const total = await prisma.booking.count({
        where: {
            AND: andConditions,
        },
    });

    return {
        data: booking,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const bookingStatus = async (
    bookingId: string,
    data: { status: BookingStatus; meetingLink?: string },
) => {
    const validStatus = Object.values(BookingStatus);

    if (!validStatus.includes(data.status)) {
        throw new Error(
            `Invalid status. Status must be one of: ${validStatus.join(", ")}`,
        );
    }

    const updateData: any = { status: data.status };
    if (data.meetingLink !== undefined) {
        updateData.meetingLink = data.meetingLink;
    }

    return await prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
    });
};

export const BookingService = {
    createBooking,
    mySessions,
    upCommingSession,
    teachingSession,
    getAllBooking,
    bookingStatus,
};
