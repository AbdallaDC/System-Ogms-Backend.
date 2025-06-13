import express from "express";
import { saveUserPushToken } from "../controllers/push.controller";
import { protect } from "../middleware/protect";

const router = express.Router();

router.post("/save-token", protect, saveUserPushToken);

export default router;
