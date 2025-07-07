import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingByUserId,
  getUnassignedBookings,
  getBookingReport,
} from "../controllers/booking.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

// router.use(protect);

// report
router.get("/report", getBookingReport);

router.route("/").post(createBooking).get(getAllBookings);

router
  .route("/:id")
  .get(getBookingById)
  .put(updateBooking)
  .delete(deleteBooking);

router.get("/user/:user_id", protect, getBookingByUserId);
router.get("/unassigned/bookings", protect, getUnassignedBookings);

export default router;
