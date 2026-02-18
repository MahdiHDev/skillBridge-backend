import { NextFunction, Request, Response } from "express";
import { ProfileStatus, UserRole } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { transporter } from "../../lib/mailer";
import { TutorService } from "./tutor.service";

const createTutorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const user = req.user;

    try {
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized",
            });
        }

        const result = await TutorService.createTutorProfile(
            { bio: req.body.bio },
            user.id,
            // {
            //     subjectName: req.body.subjectName,
            //     hourlyRate: req.body.hourlyRate,
            //     experienceYears: req.body.experienceYears,
            //     level: req.body.level,
            // },
        );

        return res.status(200).json({
            success: true,
            message:
                "Tutor profile created successfully. You will get email once your profile is verified.",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

const createTeachingSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {
            subjectName,
            hourlyRate,
            experienceYears,
            level,
            bio,
            isPrimary,
        } = req.body;

        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized",
            });
        }

        const result = await TutorService.createTeachingSession(user.id, {
            subjectName,
            hourlyRate,
            experienceYears,
            level,
            bio,
            isPrimary,
        });

        res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllTutors = async (req: Request, res: Response) => {
    try {
        const { search, subject, minPrice, maxPrice, minRating } = req.query;

        const searchString = typeof search === "string" ? search : undefined;

        const status = (req.query.status as ProfileStatus) || undefined;

        const isVerified =
            req.query.isVerified === "true"
                ? true
                : req.query.isVerified === "false"
                  ? false
                  : undefined;

        const role = req.user?.role as UserRole;

        const subjectSlug = typeof subject === "string" ? subject : undefined;

        const minPriceNumber = minPrice ? Number(minPrice) : undefined;

        const maxPriceNumber = maxPrice ? Number(maxPrice) : undefined;

        const minRatingNumber = minRating ? Number(minRating) : undefined;

        const { page, limit, skip, sortBy, sortOrder } =
            paginationSortingHelper(req.query);

        const result = await TutorService.getAllTutors({
            search: searchString,
            subjectSlug,
            minPrice: minPriceNumber,
            maxPrice: maxPriceNumber,
            minRating: minRatingNumber,
            limit,
            page,
            skip,
            sortBy,
            sortOrder: sortOrder as "asc" | "desc",

            status,
            role,
            isVerified,
        });
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

const getTutorProfileByUserId = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        return res.status(400).json({
            error: "Unauthorized",
        });
    }

    try {
        const profile = await TutorService.getTutorProfileByUserId(user.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Tutor profile not found.",
            });
        }

        if (profile.status === "PENDING" && !profile.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Your tutor profile is pending verification.",
            });
        }

        if (profile.status === "REJECTED") {
            return res.status(400).json({
                success: false,
                message:
                    "Your tutor profile application has been rejected. Please review your profile and reapply.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tutor profile retrieved successfully",
            data: profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tutor profile",
        });
        console.error(error);
    }
};

const getTutorProfileById = async (req: Request, res: Response) => {
    const { tutorProfileId } = req.params;

    try {
        const profile = await TutorService.getTutorProfileById(
            tutorProfileId as string,
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Tutor not found",
            });
        }

        // Only approved tutors visible publicly
        if (profile.status !== "APPROVED") {
            return res.status(403).json({
                success: false,
                message: "Tutor profile is not publicly available",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tutor profile retrieved successfully",
            data: profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tutor profile",
        });
    }
};

const getTeachingSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.id;
        const result = await TutorService.getTeachingSession(userId!);
        return res.status(200).json({
            success: true,
            message: "Teaching session retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const approveTutorProfile = async (req: Request, res: Response) => {
    const { tutorProfileId, status } = req.body;
    const profileStatus = status.toUpperCase();

    const adminId = req.user;

    if (!adminId) {
        return res.status(400).json({
            error: "Unauthorized",
        });
    }

    try {
        const updatedProfile = await TutorService.approveTutorProfile(
            status.toUpperCase(),
            tutorProfileId,
            adminId.id,
        );

        console.log(updatedProfile.status);

        let subject = "";
        let html = "";

        if (profileStatus === "APPROVED") {
            subject = "Your Tutor Profile Has Been Approved 🎉";

            html = `
                <h1>Hello, ${updatedProfile.user.name}!</h1>
                <p>Congratulations! Your tutor profile has been <b>approved</b>.</p>
                <p>You can now start receiving bookings from students.</p>
                <br />
                <a href="${process.env.FRONTEND_URL}/dashboard">
                Go to Dashboard
                </a>
            `;
        }

        if (profileStatus === "REJECTED") {
            subject = "Your Tutor Profile Application Status";

            html = `
                <h1>Hello, ${updatedProfile.user.name}!</h1>
                <p>We regret to inform you that your tutor profile has been <b>rejected</b>.</p>
                <p>Please review your profile information and reapply.</p>
                <br />
                <a href="${process.env.FRONTEND_URL}/support">
                Contact Support
                </a>
            `;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: updatedProfile.user.email,
            subject,
            html,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email failed to send:", error);
            } else {
                console.log("Approval email sent: ", info.response);
            }
        });

        res.status(200).json({
            message: `Tutor ${status.toLowerCase()} successfully and notification email sent.`,
            data: updatedProfile,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to approve tutor",
        });
    }
};

export const TutorController = {
    createTutorProfile,
    createTeachingSession,
    getAllTutors,
    getTutorProfileById,
    approveTutorProfile,
    getTutorProfileByUserId,
    getTeachingSession,
};
