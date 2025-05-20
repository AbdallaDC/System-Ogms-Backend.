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

// Set JWT token in a secure HTTP-only cookie
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = user.generateAuthToken();

  // Set cookie options
  const cookieOptions: CookieOptions = {
    httpOnly: true, // Prevents access from JavaScript (more secure)
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    sameSite: "strict", // Helps prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };

  res.cookie("jwt", token, cookieOptions); // Store token in cookie

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

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
    sendTokenResponse(user, 200, res);
  }
);
