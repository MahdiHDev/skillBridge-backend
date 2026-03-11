import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const checkUserBanStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. Please log in to access this resource.",
        });
    }

    const userId = user.id;

    const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: { status: true },
    });

    if (userData?.status === "BANNED") {
        return res.status(403).json({
            success: false,
            message: "your account has been been banned by admin.",
        });
    }

    next();
};

export default checkUserBanStatus;
