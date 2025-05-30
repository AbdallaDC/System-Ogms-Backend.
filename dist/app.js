"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_controller_1 = __importDefault(require("./controllers/error.controller"));
const app = (0, express_1.default)();
// routes
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const assign_routes_1 = __importDefault(require("./routes/assign.routes"));
// middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// routes
app.use("/api/v1/auth", auth_route_1.default);
app.use("/api/v1/users", user_routes_1.default);
app.use("/api/v1/services", service_routes_1.default);
app.use("/api/v1/vehicles", vehicle_routes_1.default);
app.use("/api/v1/bookings", booking_routes_1.default);
app.use("/api/v1/assigns", assign_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: "fail",
        message: `Not found! ${req.originalUrl}`,
    });
});
app.use(error_controller_1.default);
exports.default = app;
