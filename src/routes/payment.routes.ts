import express from "express";
import {
  createPayment,
  createPaymentForInventory,
  getAllTransactions,
  getTransActionsByUserId,
  getSingleTransactionById,
  getPaymentReport,
  // getAllPayments,
  // getPaymentById,
  // updatePayment,
  // deletePayment,
} from "../controllers/payment.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

// router.use(protect);

// report
router.get("/report", getPaymentReport);

router.route("/").post(createPayment).get(getAllTransactions);
router.route("/inventory").post(createPaymentForInventory);

router.get("/:id", getSingleTransactionById);
router.get("/user/transactions", getTransActionsByUserId);

export default router;
