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
import inventoryRoutes from "./routes/inventory.routes";
import historyRoutes from "./routes/history.routes";

// middleware
app.use(express.json());
app.use(cors({ origin: "*", allowedHeaders: "*" }));

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/assigns", assignRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/history", historyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Not found! ${req.originalUrl}`,
  });
});

app.use(globalErrorHandler);

export default app;
