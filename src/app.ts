import express from "express";
import cors from "cors";
import globalErrorHandler from "./controllers/error.controller";
const app = express();

// routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.routes";
import serviceRoutes from "./routes/service.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import bookingRoutes from "./routes/booking.routes";
import assignRoutes from "./routes/assign.routes";

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/assigns", assignRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Not found! ${req.originalUrl}`,
  });
});

app.use(globalErrorHandler);

export default app;
