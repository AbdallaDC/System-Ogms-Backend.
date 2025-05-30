"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
router.get("/", protect_1.protect, (0, protect_1.restrictTo)("admin"), user_controller_1.getAllUsers);
router.get("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), user_controller_1.getUserById);
router.put("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), user_controller_1.updateUser);
router.delete("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), user_controller_1.deleteUser);
router.get("/role/:role", protect_1.protect, (0, protect_1.restrictTo)("admin"), user_controller_1.getAllUsersByRole);
exports.default = router;
