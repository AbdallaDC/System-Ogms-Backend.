import Service from "../models/service.model";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middleware/protect";
import APIFeatures from "../utils/APIFeatures";
import Inventory from "../models/inventory.model";
import Booking from "../models/booking.model";
import Assign from "../models/assign.model";

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
    // .populate({
    //   path: "usedInventory.item",
    //   select: "name price type",
    // });

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

// service report

export const getServiceReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceId, startDate, endDate } = req.query;

    const services = serviceId
      ? await Service.find({ _id: serviceId }).lean()
      : await Service.find().lean();

    const bookings = await Booking.find(
      serviceId ? { service_id: serviceId } : {}
    )
      .populate("service_id")
      .lean();

    const assigns = await Assign.find().lean();
    // console.log("assigns", assigns);

    const report = services.map((service) => {
      const serviceBookings = bookings
        .filter(
          (b) =>
            b.service_id &&
            b.service_id._id.toString() === service._id.toString()
        )
        .filter((b) => {
          if (startDate && endDate) {
            const d = new Date(b.booking_date);
            return (
              d >= new Date(startDate as string) &&
              d <= new Date(endDate as string)
            );
          }
          return true;
        });
      // console.log("serviceBookings", serviceBookings);

      const completedBookings = serviceBookings.filter((b) => {
        const a = assigns.find(
          (a) => a.booking_id.toString() === b._id.toString()
        );
        return a?.status === "completed";
      });

      // console.log("completedBookings", completedBookings);

      return {
        service_name: service.service_name,
        totalBookings: serviceBookings.length,
        completedBookings: completedBookings.length,
        totalRevenue: completedBookings.length * (service.price || 0),
      };
    });

    res.status(200).json({
      status: "success",
      result: report.length,
      report,
    });
  }
);
