import express from "express";
import cors from "cors";
import globalErrorHandler from "./controllers/error.controller";
const app = express();

// routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.routes";

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.use(globalErrorHandler);

export default app;
