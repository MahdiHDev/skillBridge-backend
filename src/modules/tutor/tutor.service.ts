import { TutorProfile } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createTutorProfile = async (
    data: Omit<TutorProfile, "createdAt" | "updatedAt" | "userId">,
    userId: string,
) => {
    const tutorProfile = await prisma.tutorProfile.create({
        data: {
            ...data,
            userId,
        },
    });
    return tutorProfile;
};

const getAllTutors = async () => {
    const tutors = await prisma.tutorProfile.findMany();
    return tutors;
};

export const TutorService = {
    createTutorProfile,
    getAllTutors,
};
