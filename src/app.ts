import express from "express";
import cors from "cors";
import globalErrorHandler from "./controllers/error.controller";
const app = express();

// routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.routes";
import serviceRoutes from "./routes/service.routes";
import vehicleRoutes from "./routes/vehicle.routes";

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Not found!",
  });
});

app.use(globalErrorHandler);

export default app;
