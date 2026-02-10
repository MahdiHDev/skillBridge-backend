import dotenv from "dotenv";
dotenv.config();

export const config = {
    admin_credentials: {
        name: process.env.ADMIN_NAME,
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    },
};
