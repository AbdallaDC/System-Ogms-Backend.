"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const serviceSchema = new mongoose_1.Schema({
    service_name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: String,
    },
    updatedBy: {
        type: String,
    },
}, { timestamps: true });
const Service = (0, mongoose_1.model)("Service", serviceSchema);
exports.default = Service;
