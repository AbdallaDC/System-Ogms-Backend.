"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../utils/AppError"));
const sendErrDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status || "error",
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        console.error("Error: ", err);
        res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }
};
const handleCastErrorDb = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError_1.default(message, 400);
};
const handleValidationError = (err) => {
    const errors = Object.values(err.errors || {}).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError_1.default(message, 400);
};
const handleDuplicateFieldDb = (err) => {
    if (err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `${field} "${value}" already exists. Please use another value!`;
        return new AppError_1.default(message, 400);
    }
};
const handleJWTError = () => new AppError_1.default("Invalid token. Please log in again!", 401);
const handleTokenExpired = () => new AppError_1.default("Your token has expired! Please log in again.", 401);
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "production") {
        if (err.name === "CastError")
            err = handleCastErrorDb(err);
        if (err.name === "ValidationError")
            err = handleValidationError(err);
        if (err.code === 11000)
            err = handleDuplicateFieldDb(err) || err;
        if (err.name === "JsonWebTokenError")
            err = handleJWTError();
        if (err.name === "TokenExpiredError")
            err = handleTokenExpired();
        sendErrorProd(err, res);
    }
    else {
        sendErrDev(err, res);
    }
};
exports.default = globalErrorHandler;
