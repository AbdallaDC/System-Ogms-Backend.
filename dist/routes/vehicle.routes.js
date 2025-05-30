"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
router.post("/", protect_1.protect, (0, protect_1.restrictTo)("admin"), vehicle_controller_1.createVehicle);
router.get("/", protect_1.protect, (0, protect_1.restrictTo)("admin"), vehicle_controller_1.getAllVehicles);
router.get("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), vehicle_controller_1.getVehicleById);
router.put("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), vehicle_controller_1.updateVehicle);
router.delete("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), vehicle_controller_1.deleteVehicle);
exports.default = router;
