import { NextFunction, Request, Response } from "express";
import { AvailabilityService } from "./availability.service";

const createAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new Error("User not found");
    }

    try {
        const result = await AvailabilityService.createAvailability(
            userId,
            req.body,
        );

        res.status(200).json({
            success: true,
            message: "create availability slots created!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getOwnAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new Error("User not found");
    }
    try {
        const result = await AvailabilityService.getAvailability(userId);

        res.status(200).json({
            success: true,
            message: "Availability Slot Retrived Successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAvailibilityByTutorId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const tutorProfileId = req.params.tutorId;

    try {
        const result = await AvailabilityService.getAvailibilityByTutorId(
            tutorProfileId as string,
        );

        res.status(200).json({
            success: true,
            message: "Availability Slot Retrived Successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const userId = req.user?.id;
    const slotId = req.params.slotId;

    if (!userId) {
        throw new Error("User Id not found");
    }

    const { dayOfWeek, startTime, endTime, startDate, endDate } = req.body;

    try {
        const result = await AvailabilityService.updateAvailability(
            userId,
            slotId as string,
            { dayOfWeek, startTime, endTime, startDate, endDate },
        );

        res.status(200).json({
            success: true,
            message: "Availability Slot updated Successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const slotId = req.params.slotId;

    try {
        const result = await AvailabilityService.deleteAvailability(
            slotId as string,
        );

        res.status(200).json({
            success: true,
            message: "Availability Slot deleted Successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const availabilityController = {
    createAvailability,
    getOwnAvailability,
    getAvailibilityByTutorId,
    updateAvailability,
    deleteAvailability,
};
