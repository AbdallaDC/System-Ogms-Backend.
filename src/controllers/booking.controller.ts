import Booking from "../models/booking.model";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middleware/protect";
import APIFeatures from "../utils/APIFeatures";
import User from "../models/user.model";
import Assign from "../models/assign.model";
import Service from "../models/service.model";
import { calculateBookingTotal } from "../utils/booking-total-calculator.utitl";
import inventoryModel from "../models/inventory.model";

// create booking
// export const createBooking = catchAsync(
//   async (req: AuthRequest, res: Response, next: NextFunction) => {
//     const userId = req.body.user_id;

//     const user = await User.findById(userId);

//     // if (user?.role !== "customer") {
//     //   return next(
//     //     new AppError("You are not authorized to create booking!", 403)
//     //   );
//     // }

//     const booking = await Booking.create({
//       ...req.body,
//       createdBy: req.user?.email,
//     });

//     res.status(201).json({
//       status: "success",
//       message: "Booking created successfully!",
//       booking,
//     });
//   }
// );

export const createBooking = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { service_id } = req.body;

    if (!service_id) {
      return next(new AppError("Please provide service_id", 400));
    }

    // // Verify all inventory items exist and have enough stock
    // for (const entry of usedInventory) {
    //   const item = await inventoryModel.findById(entry.item);
    //   if (!item) {
    //     return next(
    //       new AppError(`Inventory item not found: ${entry.item}`, 404)
    //     );
    //   }
    //   if (item.quantity < entry.quantity) {
    //     return next(
    //       new AppError(
    //         `Insufficient stock for ${item.name}: available=${item.quantity}, requested=${entry.quantity}`,
    //         400
    //       )
    //     );
    //   }
    // }

    // Create booking
    const booking = await Booking.create(req.body);

    // Deduct inventory stock
    // for (const entry of usedInventory) {
    //   await inventoryModel.findByIdAndUpdate(entry.item, {
    //     $inc: { quantity: -entry.quantity },
    //   });
    // }

    // Calculate total
    // const totals = await calculateBookingTotal(booking._id.toString());

    res.status(201).json({
      status: "success",
      data: {
        booking,
        // totals,
      },
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
        select: "name email phone role user_id",
      })
      .populate({
        path: "service_id",
        select: "service_name service_id price",
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
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "user_id",
        select: "name email phone role",
      })
      .populate({
        path: "vehicle_id",
        select: "make model year",
      })
      .populate({
        path: "service_id",
        select: "service_name description",
      });

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

// get booking by user id
export const getBookingByUserId = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const booking = await Booking.find({
      user_id: req.params.user_id,
    })
      .populate({
        path: "service_id",
        select: "service_name service_id price",
      })
      .populate({
        path: "user_id",
        select: "name email phone user_id",
      })
      .populate({
        path: "vehicle_id",
        select: "model year vehicle_id",
      });

    if (!booking) {
      return next(new AppError("Booking not found!", 404));
    }
    res.status(200).json({
      status: "success",
      result: booking.length,
      booking,
    });
  }
);

// get unassigned bookings
export const getUnassignedBookings = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Find bookings whose _id is NOT present in any Assign document's booking_id
    const assignedBookingIds = await Assign.distinct("booking_id");
    const bookings = await Booking.find({
      _id: { $nin: assignedBookingIds },
      status: "pending",
    })
      .populate({
        path: "user_id",
        select: "name email phone role user_id",
      })
      .populate({
        path: "vehicle_id",
        select: "make model year vehicle_id",
      })
      .populate({
        path: "service_id",
        select: "service_name service_id price",
      });

    if (!bookings || bookings.length === 0) {
      return next(new AppError("Booking not found!", 404));
    }
    res.status(200).json({
      status: "success",
      result: bookings.length,
      bookings: bookings,
    });
  }
);
