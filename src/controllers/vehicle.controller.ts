import Vehicle from "../models/vehicle.model";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middleware/protect";
import APIFeatures from "../utils/APIFeatures";

// create vehicle
export const createVehicle = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const vehicle = await Vehicle.create({
      ...req.body,
      createdBy: req.user?.email,
    });

    res.status(201).json({
      status: "success",
      message: "Vehicle created successfully!",
      vehicle,
    });
  }
);

export const getAllVehicles = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const features = new APIFeatures(Vehicle.find(), req.query)
      .filter()
      .sort()
      .limitingFields()
      .paginate();

    // Add search functionality
    if (req.query.search) {
      features.query = features.query.find({
        vehicle_name: { $regex: req.query.search, $options: "i" },
      });
    }
    const vehicles = await features.query.populate({
      path: "owner",
      select: "name email phone",
    });

    // get total vehicles
    const totalVehicleDocs = await Vehicle.countDocuments();

    res.status(200).json({
      status: "success",
      result: vehicles.length,
      count: totalVehicleDocs,
      vehicles,
    });
  }
);

export const getVehicleById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError("Vehicle not found!", 404));
    }
    res.status(200).json({
      status: "success",
      vehicle,
    });
  }
);

// update vehicle
export const updateVehicle = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.email },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedVehicle) {
      return next(new AppError("Vehicle not found!", 404));
    }
    res.status(200).json({
      status: "success",
      vehicle: updatedVehicle,
    });
  }
);

// delete vehicle
export const deleteVehicle = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!deletedVehicle) {
      return next(new AppError("Vehicle not found!", 404));
    }
    res.status(204).json({
      status: "success",
      message: "Vehicle deleted successfully!",
    });
  }
);
