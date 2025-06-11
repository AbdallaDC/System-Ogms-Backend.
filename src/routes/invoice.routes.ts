// invoice.routes.ts
import express from "express";
import { downloadInvoice } from "../controllers/invoice.controller";
import { protect } from "../middleware/protect";

const router = express.Router();

router.get("/:paymentId", downloadInvoice);

export default router;
