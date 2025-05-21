import Assign from "../models/assign.model";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middleware/protect";
import APIFeatures from "../utils/APIFeatures";
import User from "../models/user.model";

// create assign
export const createAssign = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.body.user_id;

    const user = await User.findById(userId);

    if (user?.role !== "mechanic") {
      return next(new AppError("only mechanic can assign to work", 403));
    }

    const assign = await Assign.create({
      ...req.body,
      createdBy: req.user?.email,
    });

    res.status(201).json({
      status: "success",
      message: "Assign created successfully!",
      assign,
    });
  }
);

export const getAllAssigns = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const features = new APIFeatures(Assign.find(), req.query)
      .filter()
      .sort()
      .limitingFields()
      .paginate();

    const assigns = await features.query
      .populate({
        path: "user_id",
        select: "name email phone",
      })
      .populate({
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
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

    // get total assigns
    const totalAssignDocs = await Assign.countDocuments();

    res.status(200).json({
      status: "success",
      result: assigns.length,
      count: totalAssignDocs,
      assigns,
    });
  }
);

export const getAssignById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const assign = await Assign.findById(req.params.id)
      .populate({
        path: "user_id",
        select: "name email phone",
      })
      .populate({
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
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

    if (!assign) {
      return next(new AppError("Assign not found!", 404));
    }
    res.status(200).json({
      status: "success",
      assign,
    });
  }
);

// update assign
export const updateAssign = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const updatedAssign = await Assign.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.email },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAssign) {
      return next(new AppError("Assign not found!", 404));
    }
    res.status(200).json({
      status: "success",
      assign: updatedAssign,
    });
  }
);

// delete assign
export const deleteAssign = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const deletedAssign = await Assign.findByIdAndDelete(req.params.id);

    if (!deletedAssign) {
      return next(new AppError("Assign not found!", 404));
    }
    res.status(204).json({
      status: "success",
      message: "Assign deleted successfully!",
    });
  }
);

// get assign by user id
export const getAssignByUserId = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const assign = await Assign.find({
      user_id: req.params.user_id,
    }).populate({
      path: "booking_id",
      select: "booking_date status service_id vehicle_id",
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

    if (!assign) {
      return next(new AppError("Assign not found!", 404));
    }
    res.status(200).json({
      status: "success",
      result: assign.length,
      assign,
    });
  }
);
