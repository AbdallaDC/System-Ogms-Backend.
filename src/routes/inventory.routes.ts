import express from "express";
import {
  createInventoryItem,
  getAllInventory,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryById,
} from "../controllers/inventory.controller";
import { protect, restrictTo } from "../middleware/protect";
import { preventInventoryDeletion } from "../middleware/prevent-inventory-deletion";

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createInventoryItem)
  .get(protect, getAllInventory);

router
  .route("/:id")
  .get(protect, getInventoryById)
  .put(protect, restrictTo("admin"), updateInventoryItem)
  .delete(
    protect,
    preventInventoryDeletion,
    restrictTo("admin"),
    deleteInventoryItem
  );

export default router;
