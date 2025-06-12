import express from "express";
import {
  // getServiceHistoryByVehicle,
  getServiceHistoryByCustomer,
  getServiceHistoryByMechanic,
  getServiceHistoryByService,
} from "../controllers/history.controller";

const router = express.Router();

// router.get("/vehicle/:vehicleId", getServiceHistoryByVehicle);
router.get("/customer/:userId", getServiceHistoryByCustomer);
router.get("/mechanic/:userId", getServiceHistoryByMechanic);
router.get("/service/:serviceId", getServiceHistoryByService);

export default router;
