import { UserStatus } from "../../../generated/prisma/enums";
import { UserWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

type getAllUsersOptions = {
    search: string | undefined;
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
};

const getAllUsers = async ({
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
    search,
}: getAllUsersOptions) => {
    const andConditions: UserWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ],
        });
    }

    const users = await prisma.user.findMany({
        take: limit,
        skip,
        where: {
            AND: andConditions,
        },
        orderBy: {
            [sortBy]: sortOrder,
        },
    });

    const total = await prisma.user.count({
        where: {
            AND: andConditions,
        },
    });

    return {
        data: users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const updateUserStatus = async (id: string, status: UserStatus) => {
    // Validate status
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
        throw new Error("Invalid status. Status must be ACTIVE or BANNED.");
    }

    return await prisma.user.update({
        where: { id },
        data: { status },
    });
};

export const adminService = { getAllUsers, updateUserStatus };
