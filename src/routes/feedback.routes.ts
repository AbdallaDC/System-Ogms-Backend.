import express from "express";
import {
  createFeedback,
  getFeedbackSummaryByService,
  getFeedbackByBookingId,
  getFeedbackSummaryByServiceId,
} from "../controllers/feedback.controller";
import { protect } from "../middleware/protect";

const router = express.Router();

router.use(protect);

router.post("/", createFeedback);
router.get("/summary/service", getFeedbackSummaryByService);

router.get("/summary/service/:id", getFeedbackSummaryByServiceId);
router.get("/booking/:id", getFeedbackByBookingId);

export default router;
