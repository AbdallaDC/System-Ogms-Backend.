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

router.post("/", protect,createVehicle);
router.get("/", protect, getAllVehicles);
router.get("/:id", protect, getVehicleById);
router.put("/:id", protect, updateVehicle);
router.delete("/:id", protect,);

export default router;
