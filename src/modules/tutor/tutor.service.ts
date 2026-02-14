import { ProfileStatus, TutorLevel } from "../../../generated/prisma/client";
import { TutorProfileWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

type getAllTutorsOptions = {
    search: string | undefined;
    isVerified: boolean | undefined;
    status: ProfileStatus | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
};

const createTutorProfile = async (
    data: { bio?: string },
    userId: string,
    extra: {
        subjectName: string;
        hourlyRate: number;
        experienceYears: number;
        level: TutorLevel;
        bio?: string;
    },
) => {
    const slug = extra.subjectName.toLowerCase().trim().replace(/\s+/g, "-");

    return await prisma.$transaction(async (tx) => {
        const profile = await tx.tutorProfile.upsert({
            where: { userId },
            update: {},
            create: {
                ...data,
                userId,
                status: "PENDING",
            },
            include: {
                user: true,
            },
        });

        // 2. handle the subject creation
        const subject = await tx.subject.upsert({
            where: { slug },
            update: {},
            create: {
                name: extra.subjectName,
                slug,
            },
        });

        // 3. Create TutorCategory
        const TutorCategory = await tx.tutorCategory.create({
            data: {
                tutorProfileId: profile.id,
                subjectId: subject.id,
                hourlyRate: extra.hourlyRate,
                experienceYears: extra.experienceYears,
                level: extra.level,
                description: extra.bio || "",
            },
        });

        return { profile, TutorCategory };
    });
};

const getAllTutors = async ({
    search,
    isVerified,
    status,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
}: getAllTutorsOptions) => {
    const andConditions: TutorProfileWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                {
                    bio: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    user: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    user: {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        });
    }

    if (typeof isVerified === "boolean") {
        andConditions.push({
            isVerified,
        });
    }

    if (status) {
        andConditions.push({
            status,
        });
    }

    const tutors = await prisma.tutorProfile.findMany({
        take: limit,
        skip,
        where: {
            AND: andConditions,
        },
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            user: true,
            tutorCategories: {
                include: {
                    subject: true,
                },
            },
        },
    });

    const total = await prisma.tutorProfile.count({
        where: {
            AND: andConditions,
        },
    });

    return {
        data: tutors,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const approveTutorProfile = async (
    status: ProfileStatus,
    tutorProfileId: string,
    adminId: string,
) => {
    const updatedProfile = await prisma.$transaction(async (tx) => {
        const profile = await tx.tutorProfile.update({
            where: { id: tutorProfileId },
            data: {
                status,
                isVerified: status === "APPROVED",
            },
            include: {
                user: true,
            },
        });

        // Only update role to TUTOR if user is not already an ADMIN
        if (status === "APPROVED" && profile.user.role !== "ADMIN") {
            await tx.user.update({
                where: { id: profile.userId },
                data: {
                    role: "TUTOR",
                },
            });
        }

        await tx.adminLog.create({
            data: {
                adminId,
                action: "APPROVE_TUTOR",
                targetId: tutorProfileId,
            },
        });

        if (status === "APPROVED" && profile.user.role !== "ADMIN") {
            profile.user.role = "TUTOR";
        }

        return profile;
    });

    return updatedProfile;
};

const getTutorProfileByUserId = async (userId: string) => {
    const profile = await prisma.tutorProfile.findUnique({
        where: { userId },
        include: {
            tutorCategories: {
                include: {
                    subject: true,
                },
            },
        },
    });

    return profile;
};

export const TutorService = {
    createTutorProfile,
    getAllTutors,
    approveTutorProfile,
    getTutorProfileByUserId,
};
