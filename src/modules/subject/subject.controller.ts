import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../../generated/prisma/client";
import { SubjectService } from "./subject.service";

const createSubject = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { subject } = req.body;

        const result = await SubjectService.createSubject(subject);

        res.status(200).json({
            success: true,
            message: "Subject Created Successfully!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllSubjects = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await SubjectService.getAllSubjects();

        res.status(200).json({
            success: true,
            message: "Subjects Retrived Successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateSubject = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params;
    try {
        const { subject } = req.body;

        if (!subject) {
            throw new Error("Subject field must be required");
        }

        const result = await SubjectService.updateSubject(
            id as string,
            subject,
        );

        res.status(200).json({
            success: true,
            message: "Subject Updated Successfully",
            data: result,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2025 = record not found
            if (error.code === "P2025") {
                throw new Error(
                    `Subject with ID '${id}' not found. Cannot update non-existent record.`,
                );
            }
        }
        next(error);
    }
};

const deleteSubject = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params;
    try {
        const result = await SubjectService.deleteSubject(id as string);

        res.status(200).json({
            success: true,
            message: "Subject deleted Successfully!",
            data: result,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2025 = record not found
            if (error.code === "P2025") {
                throw new Error(
                    `Subject with ID '${id}' not found. Cannot delete non-existent record.`,
                );
            }
        }
        next(error);
    }
};

export const SubjectController = {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
};
