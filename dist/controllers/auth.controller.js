"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const AppError_1 = __importDefault(require("../utils/AppError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const user_model_1 = __importDefault(require("../models/user.model"));
exports.register = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, phone, address, role } = req.body;
    const user = yield user_model_1.default.create({
        name,
        email,
        password,
        phone,
        address,
        role,
    });
    res.status(201).json({
        status: "success",
        message: "User created successfully!",
        user,
    });
}));
// login
exports.login = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_model_1.default.findOne({ email }).select("+password");
    if (!user || !(yield user.comparePassword(password))) {
        return next(new AppError_1.default("Invalid email or password", 401));
    }
    if (!user.is_active) {
        return next(new AppError_1.default("Your account is not active yet. Please contact the admin.", 401));
    }
    // sendTokenResponse(user, 200, res);
    const token = user.generateAuthToken();
    res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        token,
        user,
    });
}));
