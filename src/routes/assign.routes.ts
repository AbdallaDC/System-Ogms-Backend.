import express from "express";
import {
  createAssign,
  getAllAssigns,
  getAssignById,
  updateAssign,
  deleteAssign,
  getAssignByUserId,
  transferAssign,
  updateAssignStatus,
} from "../controllers/assign.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, restrictTo("admin"), createAssign);
router.get("/", protect, restrictTo("admin"), getAllAssigns);
router.get("/:id", protect, restrictTo("admin"), getAssignById);
router.put("/:id", protect, restrictTo("admin"), updateAssign);
router.patch("/:id/status", protect, updateAssignStatus);
router.delete("/:id", protect, restrictTo("admin"), deleteAssign);

// Put this FIRST!
router.get("/user/:user_id", protect, getAssignByUserId);

// Then this
router.get("/:id", protect, restrictTo("admin"), getAssignById);

router.put("/:id/transfer", protect, restrictTo("admin"), transferAssign);

export default router;
