import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceReport,
} from "../controllers/service.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, restrictTo("admin"), createService);
router.get("/", protect, restrictTo("admin", "customer"), getAllServices);
router.get("/:id", protect, restrictTo("admin"), getServiceById);
router.put("/:id", protect, restrictTo("admin"), updateService);
router.delete("/:id", protect, restrictTo("admin"), deleteService);

router.get("/get/report", protect, restrictTo("admin"), getServiceReport);

export default router;
