import { Request, Response, NextFunction, CookieOptions } from "express";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import User, { IUser } from "../models/user.model";
import { logAudit } from "../utils/logAudit.util";
import { AuthRequest } from "../middleware/protect";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  role?: "admin" | "mechanic" | "customer";
  license_palate?: string;
  vehicle_name?: string;
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    role,
    license_palate,
    vehicle_name,
  } = req.body as RegisterInput;

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role,
    license_palate,
    vehicle_name,
  });

  res.status(201).json({
    status: "success",
    message: "User created successfully!",
    user,
  });
});

// login
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginInput;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid email or password", 401));
    }
    if (!user.is_active) {
      await logAudit({
        action: "login failed",
        actor: user._id,
        module: "login",
        // target: vehicle._id,
        description: `user ${user.email} tried to login but is not active`,
      });
      return next(
        new AppError(
          "Your account is not active yet. Please contact the admin.",
          401
        )
      );
    }
    // sendTokenResponse(user, 200, res);
    const token = user.generateAuthToken();
    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
      user,
    });
    await logAudit({
      action: "logged in",
      actor: user._id,
      module: "login",
      // target: vehicle._id,
      description: `User ${user.email} logged in successfully`,
    });
  }
);

// change password
export const changePassword = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError("Please provide all fields", 400));
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError("Please provide all fields", 400));
    }

    const user = await User.findById(req.user?.id).select("+password");
    // console.log("user", user);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError("your current password is incorrect", 401));
    }

    // check if current password equals new password
    if (currentPassword === newPassword) {
      return next(
        new AppError("New password cannot be same as current password", 400)
      );
    }

    if (newPassword !== confirmPassword) {
      return next(
        new AppError("New password and confirm password do not match", 400)
      );
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
      user,
    });
  }
);
