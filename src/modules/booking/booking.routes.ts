import { Router, type Router as ExpressRouter } from "express";
import { bookingController } from "./booking.controller";

const bookingRoutes: ExpressRouter = Router();

bookingRoutes.post("/", bookingController.createBooking);

bookingRoutes.get("/create", (req, res) => {
    res.send("Booking route");
});

export default bookingRoutes;
