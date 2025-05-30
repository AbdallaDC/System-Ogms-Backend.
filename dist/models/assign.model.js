"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const assignSchema = new mongoose_2.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    booking_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
    },
    status: {
        type: String,
        default: "pending",
    },
    createdBy: {
        type: String,
    },
    updatedBy: {
        type: String,
    },
}, { timestamps: true });
const Assign = mongoose_1.default.model("Assign", assignSchema);
exports.default = Assign;
