// feedback.controller.ts
import { Request, Response, NextFunction } from "express";
import Feedback from "../models/feedback.model";
import Booking from "../models/booking.model";
import Assign from "../models/assign.model";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { AuthRequest } from "../middleware/protect";
import User from "../models/user.model";
import { createNotification } from "../utils/createNotification";
import mongoose from "mongoose";

export const createFeedback = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { booking_id, rating, comment } = req.body;
    const customer_id = req.user?.id;

    if (!customer_id) {
      return next(new AppError("Please login to give feedback", 401));
    }

    const booking = await Booking.findById(booking_id).populate("service_id");
    if (!booking) return next(new AppError("Booking not found", 404));
    if (booking.status !== "completed") {
      return next(
        new AppError("Feedback can only be given after completion", 400)
      );
    }

    const existing = await Feedback.findOne({ booking_id });
    if (existing) {
      return next(
        new AppError("Feedback already exists for this booking", 400)
      );
    }

    const assign = await Assign.findOne({ booking_id }).populate({
      path: "user_id",
      select: "name email phone user_id",
    });

    if (!assign) return next(new AppError("Assign not found", 404));

    const feedback = await Feedback.create({
      booking_id,
      customer_id,
      mechanic_id: assign.user_id,
      rating,
      comment,
    });

    // send notification to mechanoc
    await createNotification({
      user_id: assign.user_id._id.toString(),
      title: "new feedback",
      message: `Feedback has been given by ${req.user?.email || "customer"}`,
      type: "info",
      // link: `/bookings/${booking_id}`,
    });

    // send notification to admins
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      await createNotification({
        user_id: admin._id.toString(),
        title: "new feedback",
        message: `Feedback has been given by ${req.user?.email || "customer"}`,
        type: "info",
        link: `/bookings/${booking_id}`,
      });
    }

    res.status(201).json({ status: "success", feedback });
  }
);

// feedback summary
export const getFeedbackSummaryByService = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const summary = await Feedback.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $group: {
          _id: "$booking.service_id",
          feedbackCount: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $project: {
          serviceName: "$service.service_name",
          feedbackCount: 1,
          avgRating: 1,
        },
      },
    ]);

    res.status(200).json({ status: "success", summary });
  }
);

export const getFeedbackSummaryByServiceId = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const serviceId = req.params.id;

    const summary = await Feedback.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $match: {
          "booking.service_id": new mongoose.Types.ObjectId(serviceId),
        },
      },
      {
        $group: {
          _id: "$booking.service_id",
          feedbackCount: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    res.status(200).json({ status: "success", summary });
  }
);

export const getFeedbackByBookingId = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const bookingId = req.params.id;
    const feedback = await Feedback.findOne({ booking_id: bookingId });
    if (!feedback)
      return next(new AppError("No feedback found for this booking", 404));

    res.status(200).json({ status: "success", feedback });
  }
);
