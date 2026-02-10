import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5000;

async function main() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully!");

        app.listen(5000, () => {
            console.log("Server is running on port 5000");
        });
    } catch (error) {
        console.error("An error occurred: ", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
