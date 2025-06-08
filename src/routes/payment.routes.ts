import express from "express";
import {
  createPayment,
  getAllTransactions,
  // getAllPayments,
  // getPaymentById,
  // updatePayment,
  // deletePayment,
} from "../controllers/payment.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.use(protect);

router.route("/").post(createPayment).get(getAllTransactions);

export default router;
