import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Token ")
    ) {
      token = req.headers.authorization.split("Token ")[1];
    }
    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }
    // Verify token
    const decoded = await jwt.verify(token, JWT_SECRET);
    // console.log("decoded", decoded);

    req.user = decoded as IUser;
    next();
  }
);

type Role = "admin" | "mechanic" | "customer";
// restrict
export const restrictTo = (...roles: (Role | undefined)[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
