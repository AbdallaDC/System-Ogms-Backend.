import express from "express";
import {
  createPayment,
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

router.get("/:id", getSingleTransactionById);
router.use(protect);

router.route("/").post(createPayment).get(getAllTransactions);

router.get("/user/transactions", getTransActionsByUserId);

export default router;
