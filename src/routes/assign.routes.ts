import express from "express";
import {
  createAssign,
  getAllAssigns,
  getAssignById,
  updateAssign,
  deleteAssign,
  getAssignByUserId,
  transferAssign,
} from "../controllers/assign.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, restrictTo("admin"), createAssign);
router.get("/", protect, restrictTo("admin"), getAllAssigns);
router.get("/:id", protect, restrictTo("admin"), getAssignById);
router.put("/:id", protect, restrictTo("admin"), updateAssign);
router.delete("/:id", protect, restrictTo("admin"), deleteAssign);

router.get("/user/:user_id", protect, getAssignByUserId);
router.put("/:id/transfer", protect, restrictTo("admin"), transferAssign);

export default router;
