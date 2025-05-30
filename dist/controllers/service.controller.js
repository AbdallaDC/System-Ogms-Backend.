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
exports.deleteService = exports.updateService = exports.getServiceById = exports.getAllServices = exports.createService = void 0;
const service_model_1 = __importDefault(require("../models/service.model"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const APIFeatures_1 = __importDefault(require("../utils/APIFeatures"));
// create service
exports.createService = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const service = yield service_model_1.default.create(Object.assign(Object.assign({}, req.body), { createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }));
    res.status(201).json({
        status: "success",
        message: "Service created successfully!",
        service,
    });
}));
exports.getAllServices = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const features = new APIFeatures_1.default(service_model_1.default.find(), req.query)
        .filter()
        .sort()
        .limitingFields()
        .paginate();
    // Add search functionality
    if (req.query.search) {
        features.query = features.query.find({
            service_name: { $regex: req.query.search, $options: "i" },
        });
    }
    const services = yield features.query;
    // get total services
    const totalServiceDocs = yield service_model_1.default.countDocuments();
    res.status(200).json({
        status: "success",
        result: services.length,
        count: totalServiceDocs,
        services,
    });
}));
exports.getServiceById = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield service_model_1.default.findById(req.params.id);
    if (!service) {
        return next(new AppError_1.default("Service not found!", 404));
    }
    res.status(200).json({
        status: "success",
        service,
    });
}));
// update service
exports.updateService = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const updatedService = yield service_model_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }), {
        new: true,
        runValidators: true,
    });
    if (!updatedService) {
        return next(new AppError_1.default("Service not found!", 404));
    }
    res.status(200).json({
        status: "success",
        service: updatedService,
    });
}));
// delete service
exports.deleteService = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedService = yield service_model_1.default.findByIdAndDelete(req.params.id);
    if (!deletedService) {
        return next(new AppError_1.default("Service not found!", 404));
    }
    res.status(204).json({
        status: "success",
        message: "Service deleted successfully!",
    });
}));
