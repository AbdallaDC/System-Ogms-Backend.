"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_controller_1 = require("../controllers/service.controller");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
router.post("/", protect_1.protect, (0, protect_1.restrictTo)("admin"), service_controller_1.createService);
router.get("/", protect_1.protect, (0, protect_1.restrictTo)("admin"), service_controller_1.getAllServices);
router.get("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), service_controller_1.getServiceById);
router.put("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), service_controller_1.updateService);
router.delete("/:id", protect_1.protect, (0, protect_1.restrictTo)("admin"), service_controller_1.deleteService);
exports.default = router;
