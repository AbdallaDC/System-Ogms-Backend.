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
exports.getUnassignedBookings = exports.getBookingByUserId = exports.deleteBooking = exports.updateBooking = exports.getBookingById = exports.getAllBookings = exports.createBooking = void 0;
const booking_model_1 = __importDefault(require("../models/booking.model"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const APIFeatures_1 = __importDefault(require("../utils/APIFeatures"));
const user_model_1 = __importDefault(require("../models/user.model"));
const assign_model_1 = __importDefault(require("../models/assign.model"));
// create booking
exports.createBooking = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.body.user_id;
    const user = yield user_model_1.default.findById(userId);
    if ((user === null || user === void 0 ? void 0 : user.role) !== "customer") {
        return next(new AppError_1.default("You are not authorized to create booking!", 403));
    }
    const booking = yield booking_model_1.default.create(Object.assign(Object.assign({}, req.body), { createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }));
    res.status(201).json({
        status: "success",
        message: "Booking created successfully!",
        booking,
    });
}));
exports.getAllBookings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const features = new APIFeatures_1.default(booking_model_1.default.find(), req.query)
        .filter()
        .sort()
        .limitingFields()
        .paginate();
    const bookings = yield features.query
        .populate({
        path: "user_id",
        select: "name email phone role",
    })
        .populate({
        path: "vehicle_id",
        select: "make model year",
    })
        .populate({
        path: "service_id",
        select: "service_name",
    });
    // get total bookings
    const totalBookingDocs = yield booking_model_1.default.countDocuments();
    res.status(200).json({
        status: "success",
        result: bookings.length,
        count: totalBookingDocs,
        bookings,
    });
}));
exports.getBookingById = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.default.findById(req.params.id);
    if (!booking) {
        return next(new AppError_1.default("Booking not found!", 404));
    }
    res.status(200).json({
        status: "success",
        booking,
    });
}));
// update booking
exports.updateBooking = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const updatedBooking = yield booking_model_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email }), {
        new: true,
        runValidators: true,
    });
    if (!updatedBooking) {
        return next(new AppError_1.default("Booking not found!", 404));
    }
    res.status(200).json({
        status: "success",
        booking: updatedBooking,
    });
}));
// delete booking
exports.deleteBooking = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedBooking = yield booking_model_1.default.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
        return next(new AppError_1.default("Booking not found!", 404));
    }
    res.status(204).json({
        status: "success",
        message: "Booking deleted successfully!",
    });
}));
// get booking by user id
exports.getBookingByUserId = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.default.find({
        user_id: req.params.user_id,
    }).populate({
        path: "service_id",
        select: "service_name",
    });
    if (!booking) {
        return next(new AppError_1.default("Booking not found!", 404));
    }
    res.status(200).json({
        status: "success",
        result: booking.length,
        booking,
    });
}));
// get unassigned bookings
exports.getUnassignedBookings = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Find bookings whose _id is NOT present in any Assign document's booking_id
    const assignedBookingIds = yield assign_model_1.default.distinct("booking_id");
    const bookings = yield booking_model_1.default.find({
        _id: { $nin: assignedBookingIds },
        status: "pending",
    })
        .populate({
        path: "user_id",
        select: "name email phone role",
    })
        .populate({
        path: "vehicle_id",
        select: "make model year",
    })
        .populate({
        path: "service_id",
        select: "service_name",
    });
    if (!bookings || bookings.length === 0) {
        return next(new AppError_1.default("Booking not found!", 404));
    }
    res.status(200).json({
        status: "success",
        result: bookings.length,
        bookings: bookings,
    });
}));
