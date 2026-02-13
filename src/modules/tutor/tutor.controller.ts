import { NextFunction, Request, Response } from "express";
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
            {
                subjectName: req.body.subjectName,
                hourlyRate: req.body.hourlyRate,
                experienceYears: req.body.experienceYears,
                level: req.body.level,
            },
        );

        return res.status(200).json({
            success: true,
            message:
                "Tutor profile created successfully. You will get email once your profile is verified.",
            data: result,
        });
    } catch (error: any) {
        // handle specific prisma error
        // if (error.code === "P2002") {
        //     return res
        //         .status(400)
        //         .json({ error: "You have already created a tutor profile" });
        // }
        // res.status(500).json({
        //     success: false,
        //     message: "Failed to create post",
        // });
        // console.error(error);
        next(error);
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

const getTutorProfileByUserId = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        return res.status(400).json({
            error: "Unauthorized",
        });
    }

    try {
        const profile = await TutorService.getTutorProfileByUserId(user.id);
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
    getAllTutors,
    approveTutorProfile,
    getTutorProfileByUserId,
};
