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
exports.getAllUsersByRole = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const APIFeatures_1 = __importDefault(require("../utils/APIFeatures"));
exports.getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const features = new APIFeatures_1.default(user_model_1.default.find(), req.query)
        .filter()
        .sort()
        .limitingFields()
        .paginate();
    // Add search functionality
    if (req.query.search) {
        features.query = features.query.find({
            name: { $regex: req.query.search, $options: "i" },
        });
    }
    const users = yield features.query;
    // get total users
    const totalUserDocs = yield user_model_1.default.countDocuments();
    res.status(200).json({
        status: "success",
        result: users.length,
        count: totalUserDocs,
        users,
    });
}));
exports.getUserById = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(req.params.id).populate({
        path: "bookings",
        // select: "service_id vehicle_id",
        populate: [
            {
                path: "service_id",
                select: "service_name",
            },
            {
                path: "vehicle_id",
                select: "make model year",
            },
        ],
    });
    if (!user) {
        return next(new AppError_1.default("User not found!", 404));
    }
    res.status(200).json({
        status: "success",
        user,
    });
}));
// update user
exports.updateUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedUser) {
        return next(new AppError_1.default("User not found!", 404));
    }
    res.status(200).json({
        status: "success",
        user: updatedUser,
    });
}));
// delete user
exports.deleteUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedUser = yield user_model_1.default.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
        return next(new AppError_1.default("User not found!", 404));
    }
    res.status(204).json({
        status: "success",
        message: "User deleted successfully!",
    });
}));
// get all users by role
exports.getAllUsersByRole = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const users = await User.find({
    //   role: req.params.role,
    // })
    const features = new APIFeatures_1.default(user_model_1.default.find({ role: req.params.role }), req.query)
        .filter()
        .sort()
        .limitingFields()
        .paginate();
    // get total users
    const totalUserDocs = yield user_model_1.default.countDocuments({ role: req.params.role });
    // Add search functionality
    if (req.query.search) {
        features.query = features.query.find({
            name: { $regex: req.query.search, $options: "i" },
        });
    }
    const users = yield features.query;
    // .populate({
    //   path: "bookings",
    //   // select: "service_id vehicle_id",
    //   populate: [
    //     {
    //       path: "service_id",
    //       select: "service_name",
    //     },
    //     {
    //       path: "vehicle_id",
    //       select: "make model year",
    //     },
    //   ],
    // });
    // if (!users) {
    //   return next(new AppError("User not found!", 404));
    // }
    res.status(200).json({
        status: "success",
        result: users.length,
        count: totalUserDocs,
        users,
    });
}));
