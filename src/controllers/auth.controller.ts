import { Request, Response, NextFunction, CookieOptions } from "express";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import User, { IUser } from "../models/user.model";

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
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, phone, address, role } =
    req.body as RegisterInput;

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role,
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
  }
);
