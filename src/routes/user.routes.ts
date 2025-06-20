import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsersByRole,
} from "../controllers/user.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.get("/", protect, restrictTo("admin"), getAllUsers);
router.get("/:id", protect, restrictTo("admin"), getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

router.get("/role/:role", protect, restrictTo("admin"), getAllUsersByRole);

export default router;
