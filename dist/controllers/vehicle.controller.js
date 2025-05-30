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
exports.deleteVehicle = exports.updateVehicle = exports.getVehicleById = exports.getAllVehicles = exports.createVehicle = void 0;
const vehicle_model_1 = __importDefault(require("../models/vehicle.model"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const APIFeatures_1 = __importDefault(require("../utils/APIFeatures"));
// create vehicle
exports.createVehicle = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vehicle = yield vehicle_model_1.default.create(Object.assign(Object.assign({}, req.body), { createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }));
    res.status(201).json({
        status: "success",
        message: "Vehicle created successfully!",
        vehicle,
    });
}));
exports.getAllVehicles = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const features = new APIFeatures_1.default(vehicle_model_1.default.find(), req.query)
        .filter()
        .sort()
        .limitingFields()
        .paginate();
    // Add search functionality
    if (req.query.search) {
        features.query = features.query.find({
            vehicle_name: { $regex: req.query.search, $options: "i" },
        });
    }
    const vehicles = yield features.query.populate({
        path: "owner",
        select: "name email phone",
    });
    // get total vehicles
    const totalVehicleDocs = yield vehicle_model_1.default.countDocuments();
    res.status(200).json({
        status: "success",
        result: vehicles.length,
        count: totalVehicleDocs,
        vehicles,
    });
}));
exports.getVehicleById = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vehicle = yield vehicle_model_1.default.findById(req.params.id);
    if (!vehicle) {
        return next(new AppError_1.default("Vehicle not found!", 404));
    }
    res.status(200).json({
        status: "success",
        vehicle,
    });
}));
// update vehicle
exports.updateVehicle = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const updatedVehicle = yield vehicle_model_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }), {
        new: true,
        runValidators: true,
    });
    if (!updatedVehicle) {
        return next(new AppError_1.default("Vehicle not found!", 404));
    }
    res.status(200).json({
        status: "success",
        vehicle: updatedVehicle,
    });
}));
// delete vehicle
exports.deleteVehicle = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedVehicle = yield vehicle_model_1.default.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
        return next(new AppError_1.default("Vehicle not found!", 404));
    }
    res.status(204).json({
        status: "success",
        message: "Vehicle deleted successfully!",
    });
}));
