"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assign_controller_1 = require("../controllers/assign.controller");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
router.post("/", protect_1.protect, (0, protect_1.restrictTo)("admin"), assign_controller_1.createAssign);
router.get("/", protect_1.protect, (0, protect_1.restrictTo)("admin"), assign_controller_1.getAllAssigns);
router.get("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), assign_controller_1.getAssignById);
router.put("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), assign_controller_1.updateAssign);
router.delete("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), assign_controller_1.deleteAssign);
router.get("/user/:user_id", protect_1.protect, assign_controller_1.getAssignByUserId);
exports.default = router;
