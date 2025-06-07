import express from "express";
import {
  createInventoryItem,
  getAllInventory,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryById,
} from "../controllers/inventory.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createInventoryItem)
  .get(protect, getAllInventory);

router
  .route("/:id")
  .get(protect, getInventoryById)
  .put(protect, restrictTo("admin"), updateInventoryItem)
  .delete(protect, restrictTo("admin"), deleteInventoryItem);

export default router;
