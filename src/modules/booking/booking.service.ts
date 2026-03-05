import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

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
                },
            },
        },
    });
};

const teachingSession = async (userId: string) => {
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    return prisma.booking.findMany({
        where: {
            tutorCategory: {
                tutorProfileId: tutorProfile.id,
            },
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
            sessionDate: "asc",
        },
    });
};

const getAllBooking = async () => {
    return await prisma.booking.findMany();
};

const bookingStatus = async (bookingId: string, status: BookingStatus) => {
    const validStatus = Object.values(BookingStatus);

    if (!validStatus.includes(status)) {
        throw new Error(
            `Invalid status. Status must be one of: ${validStatus.join(", ")}`,
        );
    }

    return await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
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
