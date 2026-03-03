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

    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
        throw new Error("Invalid time format. Use HH:MM");
    }

    const sessionDate = new Date(`${data.sessionDate}T00:00:00.000`);

    const startTime = new Date(`1970-01-01T${data.startTime}:00`);
    const endTime = new Date(`1970-01-01T${data.endTime}:00`);

    if (startTime >= endTime) {
        throw new Error("Start time must be before end time");
    }

    return await prisma.$transaction(async (tx) => {
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
    });
};

export const BookingService = {
    createBooking,
};
