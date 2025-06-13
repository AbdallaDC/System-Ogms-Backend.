import express from "express";
import {
  createPayment,
  createPaymentForInventory,
  getAllTransactions,
  getTransActionsByUserId,
  getSingleTransactionById,
  // getAllPayments,
  // getPaymentById,
  // updatePayment,
  // deletePayment,
} from "../controllers/payment.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.use(protect);

router.route("/").post(createPayment).get(getAllTransactions);
router.route("/inventory").post(createPaymentForInventory);

router.get("/:id", getSingleTransactionById);
router.get("/user/transactions", getTransActionsByUserId);

export default router;
