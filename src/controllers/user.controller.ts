import User from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middleware/protect";
import APIFeatures from "../utils/APIFeatures";

export const getAllUsers = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitingFields()
      .paginate();

    // Add search functionality
    if (req.query.search) {
      features.query = features.query.find({
        name: { $regex: req.query.search, $options: "i" },
      });
    }
    const users = await features.query;

    // get total users
    const totalUserDocs = await User.countDocuments();

    res.status(200).json({
      status: "success",
      result: users.length,
      count: totalUserDocs,
      users,
    });
  }
);

export const getUserById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id).populate({
      path: "bookings",
      // select: "service_id vehicle_id",
      populate: [
        {
          path: "service_id",
          select: "service_name",
        },
        {
          path: "vehicle_id",
          select: "make model year",
        },
      ],
    });

    if (!user) {
      return next(new AppError("User not found!", 404));
    }
    res.status(200).json({
      status: "success",
      user,
    });
  }
);

// update user
export const updateUser = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(new AppError("User not found!", 404));
    }
    res.status(200).json({
      status: "success",
      user: updatedUser,
    });
  }
);

// delete user
export const deleteUser = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return next(new AppError("User not found!", 404));
    }
    res.status(204).json({
      status: "success",
      message: "User deleted successfully!",
    });
  }
);

// get all users by role
export const getAllUsersByRole = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // const users = await User.find({
    //   role: req.params.role,
    // })
    const features = new APIFeatures(
      User.find({ role: req.params.role }),
      req.query
    )
      .filter()
      .sort()
      .limitingFields()
      .paginate();

    // get total users
    const totalUserDocs = await User.countDocuments({ role: req.params.role });

    // Add search functionality
    if (req.query.search) {
      features.query = features.query.find({
        name: { $regex: req.query.search, $options: "i" },
      });
    }
    const users = await features.query;
    // .populate({
    //   path: "bookings",
    //   // select: "service_id vehicle_id",
    //   populate: [
    //     {
    //       path: "service_id",
    //       select: "service_name",
    //     },
    //     {
    //       path: "vehicle_id",
    //       select: "make model year",
    //     },
    //   ],
    // });

    // if (!users) {
    //   return next(new AppError("User not found!", 404));
    // }
    res.status(200).json({
      status: "success",
      result: users.length,
      count: totalUserDocs,
      users,
    });
  }
);
