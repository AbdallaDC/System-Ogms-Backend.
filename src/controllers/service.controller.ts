import Service from "../models/service.model";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middleware/protect";
import APIFeatures from "../utils/APIFeatures";

// create service
export const createService = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const service = await Service.create({
      ...req.body,
      createdBy: req.user?.email,
    });

    res.status(201).json({
      status: "success",
      message: "Service created successfully!",
      service,
    });
  }
);

export const getAllServices = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const features = new APIFeatures(Service.find(), req.query)
      .filter()
      .sort()
      .limitingFields()
      .paginate();

    // Add search functionality
    if (req.query.search) {
      features.query = features.query.find({
        service_name: { $regex: req.query.search, $options: "i" },
      });
    }
    const services = await features.query;

    // get total services
    const totalServiceDocs = await Service.countDocuments();

    res.status(200).json({
      status: "success",
      result: services.length,
      count: totalServiceDocs,
      services,
    });
  }
);

export const getServiceById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return next(new AppError("Service not found!", 404));
    }
    res.status(200).json({
      status: "success",
      service,
    });
  }
);

// update service
export const updateService = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.email },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedService) {
      return next(new AppError("Service not found!", 404));
    }
    res.status(200).json({
      status: "success",
      service: updatedService,
    });
  }
);

// delete service
export const deleteService = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const deletedService = await Service.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return next(new AppError("Service not found!", 404));
    }
    res.status(204).json({
      status: "success",
      message: "Service deleted successfully!",
    });
  }
);
