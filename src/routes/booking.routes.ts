import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingByUserId,
} from "../controllers/booking.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getAllBookings);
router.get("/:id", protect, restrictTo("admin"), getBookingById);
router.put("/:id", protect, restrictTo("admin"), updateBooking);
router.delete("/:id", protect, restrictTo("admin"), deleteBooking);

router.get("/user/:user_id", protect, getBookingByUserId);

export default router;
