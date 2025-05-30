"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.DB_PASSWORD = exports.DB_URI = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.DB_URI = process.env.DB_URI;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.JWT_SECRET = process.env.JWT_SECRET;
