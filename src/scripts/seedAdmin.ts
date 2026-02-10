import { prisma } from "../lib/prisma";

async function seedAdmin() {
    try {
        console.log("***** Admin Seeding Started.....");
        const adminData = {
            name: "Admin",
            email: "admin@skillbridge.com",
            role: "ADMIN",
            password: "admin123",
        };
        console.log("***** Checking Admin Exist or not");
        // check user exist on db or not
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email,
            },
        });

        if (existingUser) {
            throw new Error("User already exists!!");
        }

        const signUpAdmin = await fetch(
            "http://localhost:5000/api/auth/sign-up/email",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Origin: "http://localhost:5000",
                },
                body: JSON.stringify(adminData),
            },
        );

        console.log(signUpAdmin);

        if (signUpAdmin.ok) {
            console.log("***** Admin Seeding Completed.....");
            await prisma.user.update({
                where: {
                    email: adminData.email,
                },
                data: {
                    emailVerified: true,
                },
            });

            console.log("**** Email verification status updated!");
        }
        console.log("******* SUCCESS *******");
    } catch (error) {
        console.log(error);
    }
}

seedAdmin();

// Frontend Repo    : https://github.com/your-username/skillbridge-frontend
// Backend Repo     : https://github.com/your-username/skillbridge-backend
// Frontend Live    : https://skillbridge.vercel.app
// Backend Live     : https://skillbridge-api.vercel.app
// Demo Video       : https://drive.google.com/file/d/xxx/view
// Admin Email      : admin@skillbridge.com
// Admin Password   : admin123
