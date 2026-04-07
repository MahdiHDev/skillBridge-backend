import { DayOfWeek } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

type CreateAvailabilityInput = {
    startDate: string;
    endDate: string;
    slots: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
    }[];
};

// create availability
const createAvailability = async (
    userId: string,
    data: CreateAvailabilityInput,
) => {
    const { startDate, endDate, slots } = data;

    if (!slots || slots.length === 0) {
        throw new Error("At least one slot is required");
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (parsedStartDate >= parsedEndDate) {
        throw new Error("Invalid date range");
    }

    // find tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!tutorProfile) {
        throw new Error("Tutor Profile not found");
    }

    const tutorProfileId = tutorProfile.id;

    const existingSlots = await prisma.availabilitySlot.findMany({
        where: {
            tutorProfileId,
            isActive: true,
        },
    });

    const availabilityData: any = [];

    const validWeeks = Object.values(DayOfWeek);
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    for (const slot of slots) {
        // ✅ Enum validation
        if (slot.dayOfWeek && !validWeeks.includes(slot.dayOfWeek)) {
            throw new Error(
                `DayOfWeek must be one of: ${validWeeks.join(", ")}`,
            );
        }

        //  Validate time format BEFORE converting
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
            throw new Error("Invalid time format. Use HH:MM (24-hour format)");
        }

        const startTime = new Date(`1970-01-01T${slot.startTime}:00`);
        const endTime = new Date(`1970-01-01T${slot.endTime}:00`);

        if (startTime >= endTime) {
            throw new Error("Start time must be before end time");
        }

        //check overlap only for same day
        const sameDaySlots = existingSlots.filter(
            (s) => s.dayOfWeek === slot.dayOfWeek,
        );

        const isOverlap = sameDaySlots.some((s) => {
            const timeOverlop = startTime < s.endTime && endTime > s.startTime;

            const dateOverlop =
                parsedStartDate <= s.endDate && parsedEndDate >= s.startDate;

            return timeOverlop && dateOverlop;
        });

        if (isOverlap) {
            throw new Error(`Time slot overlaps on ${slot.dayOfWeek}`);
        }

        availabilityData.push({
            tutorProfileId,
            dayOfWeek: slot.dayOfWeek,
            startTime,
            endTime,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
        });
    }

    return await prisma.availabilitySlot.createMany({
        data: availabilityData,
        skipDuplicates: true,
    });
};

// get availability
const getAvailability = async (userId: string) => {
    // find tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!tutorProfile) {
        throw new Error("Tutor Profile not found");
    }

    const tutorProfileId = tutorProfile.id;
    console.log("tutor profle id", tutorProfileId);

    // get own availability
    const availability = await prisma.availabilitySlot.findMany({
        where: { tutorProfileId },
    });

    return availability;
};

// get availability by TutorProfileId
const getAvailibilityByTutorId = async (tutorProfileId: string) => {
    const result = await prisma.availabilitySlot.findMany({
        where: { tutorProfileId: tutorProfileId },
    });

    return result;
};

const getAvailabilityWithBookings = async (tutorId: string, date: string) => {
    const selectedDate = new Date(`${date}T00:00:00.000`);

    if (isNaN(selectedDate.getTime())) {
        throw new Error("Invalid date format");
    }

    const dayOfWeek = selectedDate
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();

    // 1️⃣ availability
    const slots = await prisma.availabilitySlot.findMany({
        where: {
            tutorProfileId: tutorId,
            dayOfWeek: dayOfWeek as DayOfWeek,
            isActive: true,
            startDate: { lte: selectedDate },
            endDate: { gte: selectedDate },
        },
    });

    if (!slots.length) return [];

    // 2️⃣ bookings
    const bookings = await prisma.booking.findMany({
        where: {
            tutorCategory: {
                tutorProfileId: tutorId,
            },
            sessionDate: selectedDate,
            status: { in: ["PENDING", "CONFIRMED"] },
        },
    });

    // 3️⃣ merge
    const result = slots.map((slot) => {
        const isBooked = bookings.some(
            (b) => b.startTime < slot.endTime && b.endTime > slot.startTime,
        );

        return {
            id: slot.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked,
        };
    });

    return result;
};

const updateAvailability = async (
    userId: string,
    availabilityId: string,
    data: {
        dayOfWeek?: DayOfWeek;
        startTime?: string;
        endTime?: string;
        startDate?: string;
        endDate?: string;
    },
) => {
    const validWeeks = Object.values(DayOfWeek);
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    // find tutorprofile
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { userId },
        select: { id: true },
    });

    if (!tutorProfile) {
        throw new Error("Tutor Profile not found");
    }

    const tutorProfileId = tutorProfile.id;

    const existingSlot = await prisma.availabilitySlot.findFirst({
        where: {
            id: availabilityId,
            tutorProfileId,
            isActive: true,
        },
    });

    if (!existingSlot) {
        throw new Error("Availability Slot not found");
    }

    //  Enum validation
    if (data.dayOfWeek && !validWeeks.includes(data.dayOfWeek as DayOfWeek)) {
        throw new Error(`DayOfWeek must be one of: ${validWeeks.join(", ")}`);
    }

    const updatedDay = data.dayOfWeek ?? existingSlot.dayOfWeek;

    const parsedStartDate = data.startDate
        ? new Date(data.startDate)
        : existingSlot.startDate;

    const parsedEndDate = data.endDate
        ? new Date(data.endDate)
        : existingSlot.endDate;

    if (parsedStartDate >= parsedEndDate) {
        throw new Error("Invalid date range");
    }

    // Validate time format
    if (
        (data.startTime && !timeRegex.test(data.startTime)) ||
        (data.endTime && !timeRegex.test(data.endTime))
    ) {
        throw new Error("Invalid time format. Use HH:MM (24-hour format)");
    }

    const startTime = data.startTime
        ? new Date(`1970-01-01T${data.startTime}:00`)
        : existingSlot.startTime;

    const endTime = data.endTime
        ? new Date(`1970-01-01T${data.endTime}:00`)
        : existingSlot.endTime;

    if (startTime >= endTime) {
        throw new Error("Start time must be before end time");
    }

    // check overlap
    const overlappingSlot = await prisma.availabilitySlot.findFirst({
        where: {
            tutorProfileId,
            dayOfWeek: updatedDay,
            isActive: true,
            id: { not: availabilityId },

            // Date overlap
            startDate: { lte: parsedEndDate },
            endDate: { gte: parsedStartDate },

            // Time overlap
            startTime: { lt: endTime },
            endTime: { gt: startTime },
        },
    });

    if (overlappingSlot) {
        throw new Error("Updated slot overlaps with existing availability");
    }
    // update
    return await prisma.availabilitySlot.update({
        where: { id: availabilityId },
        data: {
            dayOfWeek: updatedDay,
            startTime,
            endTime,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
        },
    });
};

const deleteAvailability = async (slotId: string) => {
    const result = await prisma.availabilitySlot.delete({
        where: { id: slotId },
    });

    return result;
};

export const AvailabilityService = {
    createAvailability,
    getAvailability,
    getAvailibilityByTutorId,
    getAvailabilityWithBookings,
    updateAvailability,
    deleteAvailability,
};
