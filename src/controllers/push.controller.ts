import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/protect";
import AppError from "../utils/AppError";
import User from "../models/user.model";
import catchAsync from "../utils/catchAsync";

export const saveUserPushToken = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { token } = req.body;
    if (!token) return next(new AppError("Token is required", 400));

    await User.findByIdAndUpdate(req.user?.id, { pushToken: token });

    res
      .status(200)
      .json({ status: "success", message: "Push token saved successfully" });
  }
);
