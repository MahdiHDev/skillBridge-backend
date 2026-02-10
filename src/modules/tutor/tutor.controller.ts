import { Request, Response } from "express";
import { TutorService } from "./tutor.service";

const createTutorProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized",
            });
        }

        const result = await TutorService.createTutorProfile(req.body, user.id);

        return res.status(200).json({
            success: true,
            message: "Tutor profile created successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create post",
        });
        console.error(error);
    }
};

const getAllTutors = async (req: Request, res: Response) => {
    try {
        const result = await TutorService.getAllTutors();
        return res.status(200).json({
            success: true,
            message: "All tutors retrieved successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tutors",
        });
        console.error(error);
    }
};

export const TutorController = {
    createTutorProfile,
    getAllTutors,
};
