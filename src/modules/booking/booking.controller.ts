import { NextFunction, Request, Response } from "express";
import { BookingService } from "./booking.service";

const createBooking = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await BookingService.createBooking(
            "EeBYFOTQDJbRKHbCNlqjxCPSf5FXuYxa",
            req.body,
        );
        res.status(200).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const bookingController = { createBooking };
