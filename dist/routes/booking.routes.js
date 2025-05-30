"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("../controllers/booking.controller");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
router.post("/", protect_1.protect, booking_controller_1.createBooking);
router.get("/", protect_1.protect, booking_controller_1.getAllBookings);
router.get("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), booking_controller_1.getBookingById);
router.put("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), booking_controller_1.updateBooking);
router.delete("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), booking_controller_1.deleteBooking);
router.get("/user/:user_id", protect_1.protect, booking_controller_1.getBookingByUserId);
router.get("/unassigned/bookings", protect_1.protect, booking_controller_1.getUnassignedBookings);
exports.default = router;
