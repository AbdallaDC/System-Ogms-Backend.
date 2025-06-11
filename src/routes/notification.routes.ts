import express from "express";
import {
  getUserNotifications,
  markAsSeen,
  markAllAsSeen,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller";
import { protect } from "../middleware/protect";

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.patch("/:id/seen", protect, markAsSeen);
router.put("/all/seen", protect, markAllAsSeen);

router.delete("/:id", protect, deleteNotification);
router.delete("/delete/all", protect, deleteAllNotifications);

export default router;
