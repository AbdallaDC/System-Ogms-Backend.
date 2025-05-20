import Booking from "../models/booking.model";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middleware/protect";
import APIFeatures from "../utils/APIFeatures";

// create booking
export const createBooking = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const booking = await Booking.create({
      ...req.body,
      createdBy: req.user?.email,
    });

    res.status(201).json({
      status: "success",
      message: "Booking created successfully!",
      booking,
    });
  }
);

export const getAllBookings = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const features = new APIFeatures(Booking.find(), req.query)
      .filter()
      .sort()
      .limitingFields()
      .paginate();

    const bookings = await features.query
      .populate({
        path: "user_id",
        select: "name email phone",
      })
      .populate({
        path: "vehicle_id",
        select: "make model year",
      })
      .populate({
        path: "service_id",
        select: "service_name",
      });

    // get total bookings
    const totalBookingDocs = await Booking.countDocuments();

    res.status(200).json({
      status: "success",
      result: bookings.length,
      count: totalBookingDocs,
      bookings,
    });
  }
);

export const getBookingById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found!", 404));
    }
    res.status(200).json({
      status: "success",
      booking,
    });
  }
);

// update booking
export const updateBooking = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.email },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBooking) {
      return next(new AppError("Booking not found!", 404));
    }
    res.status(200).json({
      status: "success",
      booking: updatedBooking,
    });
  }
);

// delete booking
export const deleteBooking = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return next(new AppError("Booking not found!", 404));
    }
    res.status(204).json({
      status: "success",
      message: "Booking deleted successfully!",
    });
  }
);
