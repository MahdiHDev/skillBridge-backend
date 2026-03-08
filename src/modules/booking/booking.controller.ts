import { NextFunction, Request, Response } from "express";
import { BookingStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { BookingService } from "./booking.service";

const createBooking = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const studentId = user?.id as string;

    try {
        const result = await BookingService.createBooking(studentId, req.body);
        res.status(200).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const mySessions = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const studentId = user?.id as string;

    try {
        const result = await BookingService.mySessions(studentId);

        res.status(200).json({
            success: true,
            message: "My Sessions are retrived successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const upcomingSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await BookingService.upCommingSession();
        res.status(200).json({
            success: true,
            message: "Upcoming Sessions are retrived successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const teachingSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const userId = user?.id as string;

    try {
        const { status, startDate, endDate } = req.query;

        const bookingStatus = status as BookingStatus | undefined;
        const startDateQuery = startDate as string;
        const endDateQuery = endDate as string;

        const { page, limit, skip, sortBy, sortOrder } =
            paginationSortingHelper(req.query);

        const result = await BookingService.teachingSession(userId, {
            status: bookingStatus,
            startDate: startDateQuery,
            endDate: endDateQuery,
            page,
            limit,
            skip,
            sortBy,
            sortOrder: sortOrder as "asc" | "desc",
        });
        res.status(200).json({
            success: true,
            message: "Teaching Sessions retrived successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllBooking = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {
            status,
            studentId,
            tutorId,
            subject,
            startDate,
            endDate,
            minPrice,
            maxPrice,
        } = req.query;

        const bookingStatus = status as BookingStatus | undefined;
        const studentIdQuery = studentId as string | undefined;
        const tutorIdQuery = tutorId as string | undefined;
        const subjectQuery = subject as string | undefined;
        const startDateQuery = startDate as string;

        const endDateQuery = endDate as string;
        const minPriceQuery = minPrice
            ? parseFloat(minPrice as string)
            : undefined;
        const maxPriceQuery = maxPrice
            ? parseFloat(maxPrice as string)
            : undefined;

        const { page, limit, skip, sortBy, sortOrder } =
            paginationSortingHelper(req.query);

        const result = await BookingService.getAllBooking({
            status: bookingStatus,
            studentId: studentIdQuery,
            tutorId: tutorIdQuery,
            subjectSlug: subjectQuery,
            startDate: startDateQuery,
            endDate: endDateQuery,
            minPrice: minPriceQuery,
            maxPrice: maxPriceQuery,
            page,
            limit,
            skip,
            sortBy,
            sortOrder: sortOrder as "asc" | "desc",
        });

        res.status(200).json({
            success: true,
            message: "All booking retrived successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const bookingStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await BookingService.bookingStatus(id as string, status);

        res.status(200).json({
            success: true,
            message: "Booking Status Updated Successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const bookingController = {
    createBooking,
    mySessions,
    upcomingSession,
    teachingSession,
    getAllBooking,
    bookingStatus,
};
