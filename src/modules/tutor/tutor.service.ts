import {
    ProfileStatus,
    TutorLevel,
    UserRole,
} from "../../../generated/prisma/client";
import { TutorProfileWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

type getAllTutorsOptions = {
    search: string | undefined;
    subjectSlug: string | undefined;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    minRating: number | undefined;

    status: ProfileStatus;
    isVerified: boolean | undefined;

    role?: UserRole;

    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
};

// create tutor profile
const createTutorProfile = async (data: { bio?: string }, userId: string) => {
    const profile = await prisma.tutorProfile.create({
        data: {
            ...data,
            userId,
            status: "PENDING",
        },
        include: {
            user: true,
        },
    });

    return profile;
};

// create teaching session
const createTeachingSession = async (
    userId: string,
    data: {
        subjectName: string;
        hourlyRate: number;
        experienceYears: number;
        level: TutorLevel;
        bio?: string;
        isPrimary?: boolean;
    },
) => {
    const validLevels = Object.values(TutorLevel);

    // ✅ Enum validation
    if (!validLevels.includes(data.level)) {
        const error = new Error(
            `Level must be one of: ${validLevels.join(", ")}`,
        );

        throw error;
    }

    const slug = data.subjectName.toLowerCase().trim().replace(/\s+/g, "-");

    return await prisma.$transaction(async (tx) => {
        // 1. Create Subject
        const subject = await tx.subject.upsert({
            where: { slug },
            update: {},
            create: {
                name: data.subjectName,
                slug,
            },
        });

        const getTutorProfile = await tx.tutorProfile.findUnique({
            where: {
                userId,
            },
        });

        if (!getTutorProfile) {
            throw new Error("Tutor profile not found for the user");
        }

        // 2. Create TutorCategory
        const TutorCategory = await tx.tutorCategory.create({
            data: {
                tutorProfileId: getTutorProfile.id,
                subjectId: subject.id,
                hourlyRate: data.hourlyRate,
                experienceYears: data.experienceYears,
                level: data.level,
                description: data.bio || "",
                isPrimary: data.isPrimary || false,
            },
            include: {
                subject: true,
                tutorProfile: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return TutorCategory;
    });
};

const getTeachingSession = async (userId: string) => {
    const tutorid = await prisma.tutorProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!tutorid) {
        throw new Error("Tutor profile not found for the user");
    }

    const result = await prisma.tutorCategory.findMany({
        where: {
            tutorProfileId: tutorid?.id,
        },
        include: {
            subject: true,
        },
    });

    return result;
};

const getAllTutors = async ({
    search,
    subjectSlug,
    minPrice,
    maxPrice,
    minRating,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
    status,
    role,
    isVerified,
}: getAllTutorsOptions) => {
    const andConditions: TutorProfileWhereInput[] = [];

    if (role === "ADMIN") {
        if (status) {
            andConditions.push({
                status,
            });
        }

        if (typeof isVerified === "boolean") {
            andConditions.push({
                isVerified,
            });
        }
    } else {
        // publc or students only see approved and verified tutors
        andConditions.push({
            status: "APPROVED",
            isVerified: true,
        });
    }

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

    if (subjectSlug) {
        andConditions.push({
            tutorCategories: {
                some: {
                    subject: {
                        slug: subjectSlug,
                    },
                },
            },
        });
    }

    // price filter
    if (minPrice || maxPrice) {
        andConditions.push({
            tutorCategories: {
                some: {
                    hourlyRate: {
                        gte: minPrice ?? 0,
                        lte: maxPrice ?? 999999,
                    },
                },
            },
        });
    }

    // Rating filter
    if (minRating) {
        andConditions.push({
            averageRating: {
                gte: minRating,
            },
        });
    }

    // if (typeof isVerified === "boolean") {
    //     andConditions.push({
    //         isVerified,
    //     });
    // }

    // if (status) {
    //     andConditions.push({
    //         status,
    //     });
    // }

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
            user: true,
        },
    });

    return profile;
};

const getTutorProfileById = async (id: string) => {
    return prisma.tutorProfile.findUnique({
        where: { id },

        include: {
            tutorCategories: {
                include: {
                    subject: true,
                },
            },

            reviews: {
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
};

const updateTutorProfile = async (tutorProfileId: string, bio?: string) => {
    const updatedProfile = await prisma.tutorProfile.update({
        where: { id: tutorProfileId },
        data: {
            ...(bio !== undefined && { bio }),
        },
    });

    return updatedProfile;
};

const updateTeachingSession = async (
    tutorSessionId: string,
    data: {
        hourlyRate?: number | undefined;
        experienceYears?: number | undefined;
        level?: TutorLevel;
        description?: string;
        isPrimary?: boolean;
    },
) => {
    return await prisma.tutorCategory.update({
        where: { id: tutorSessionId },
        data: {
            ...(data.hourlyRate !== undefined && {
                hourlyRate: data.hourlyRate,
            }),
            ...(data.experienceYears !== undefined && {
                experienceYears: data.experienceYears,
            }),
            ...(data.level !== undefined && { level: data.level }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
        },
        include: {
            subject: true,
            tutorProfile: {
                include: {
                    user: true,
                },
            },
        },
    });
};

const deleteTeachingSession = async (tutorSessionId: string) => {
    return await prisma.tutorCategory.delete({
        where: { id: tutorSessionId },
    });
};

export const TutorService = {
    createTutorProfile,
    createTeachingSession,
    approveTutorProfile,
    getAllTutors,
    getTutorProfileByUserId,
    getTutorProfileById,
    getTeachingSession,
    updateTutorProfile,
    updateTeachingSession,
    deleteTeachingSession,
};
