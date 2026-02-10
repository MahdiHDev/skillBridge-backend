import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import routes from "./routes";

const app: Application = express();

app.use(
    cors({
        origin: process.env.APP_URL || "http://localhost:5000",
        credentials: true,
    }),
);

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/v1", routes);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

export default app;
