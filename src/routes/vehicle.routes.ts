import express from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, restrictTo("admin"), createVehicle);
router.get("/", protect, restrictTo("admin"), getAllVehicles);
router.get("/:id", protect, restrictTo("admin"), getVehicleById);
router.put("/:id", protect, restrictTo("admin"), updateVehicle);
router.delete("/:id", protect, restrictTo("admin"), deleteVehicle);

export default router;
