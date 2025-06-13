import express from "express";
import {
  register,
  login,
  changePassword,
} from "../controllers/auth.controller";
import { protect } from "../middleware/protect";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/change-password", protect, changePassword);

export default router;
