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
exports.getAssignByUserId = exports.deleteAssign = exports.updateAssign = exports.getAssignById = exports.getAllAssigns = exports.createAssign = void 0;
const assign_model_1 = __importDefault(require("../models/assign.model"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const APIFeatures_1 = __importDefault(require("../utils/APIFeatures"));
const user_model_1 = __importDefault(require("../models/user.model"));
// create assign
exports.createAssign = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.body.user_id;
    const user = yield user_model_1.default.findById(userId);
    if ((user === null || user === void 0 ? void 0 : user.role) !== "mechanic") {
        return next(new AppError_1.default("only mechanic can assign to work", 403));
    }
    const assign = yield assign_model_1.default.create(Object.assign(Object.assign({}, req.body), { createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }));
    res.status(201).json({
        status: "success",
        message: "Assign created successfully!",
        assign,
    });
}));
exports.getAllAssigns = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const features = new APIFeatures_1.default(assign_model_1.default.find(), req.query)
        .filter()
        .sort()
        .limitingFields()
        .paginate();
    const assigns = yield features.query
        .populate({
        path: "user_id",
        select: "name email phone",
    })
        .populate({
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
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
    // get total assigns
    const totalAssignDocs = yield assign_model_1.default.countDocuments();
    res.status(200).json({
        status: "success",
        result: assigns.length,
        count: totalAssignDocs,
        assigns,
    });
}));
exports.getAssignById = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const assign = yield assign_model_1.default.findById(req.params.id)
        .populate({
        path: "user_id",
        select: "name email phone",
    })
        .populate({
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
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
    if (!assign) {
        return next(new AppError_1.default("Assign not found!", 404));
    }
    res.status(200).json({
        status: "success",
        assign,
    });
}));
// update assign
exports.updateAssign = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const updatedAssign = yield assign_model_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }), {
        new: true,
        runValidators: true,
    });
    if (!updatedAssign) {
        return next(new AppError_1.default("Assign not found!", 404));
    }
    res.status(200).json({
        status: "success",
        assign: updatedAssign,
    });
}));
// delete assign
exports.deleteAssign = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedAssign = yield assign_model_1.default.findByIdAndDelete(req.params.id);
    if (!deletedAssign) {
        return next(new AppError_1.default("Assign not found!", 404));
    }
    res.status(204).json({
        status: "success",
        message: "Assign deleted successfully!",
    });
}));
// get assign by user id
exports.getAssignByUserId = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const assign = yield assign_model_1.default.find({
        user_id: req.params.user_id,
    }).populate({
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
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
    if (!assign) {
        return next(new AppError_1.default("Assign not found!", 404));
    }
    res.status(200).json({
        status: "success",
        result: assign.length,
        assign,
    });
}));
