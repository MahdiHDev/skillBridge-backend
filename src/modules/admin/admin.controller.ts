import { NextFunction, Request, Response } from "express";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { adminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
        req.query,
    );

    const { search } = req.query;

    const searchString = typeof search === "string" ? search : undefined;

    try {
        const result = await adminService.getAllUsers({
            search: searchString,
            limit,
            page,
            skip,
            sortBy,
            sortOrder: sortOrder as "asc" | "desc",
        });
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await adminService.updateUserStatus(
            id as string,
            status,
        );
        res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const adminController = { getAllUsers, updateUserStatus };
