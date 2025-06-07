// service-history.controller.ts
import { Request, Response, NextFunction } from "express";
import Booking from "../models/booking.model";
import Assign from "../models/assign.model";
import Vehicle from "../models/vehicle.model";
import catchAsync from "../utils/catchAsync";

// Helper to apply optional filters
const applyFilters = (
  bookings: any[],
  assigns: any[],
  status?: string,
  startDate?: string,
  endDate?: string
) => {
  return bookings
    .filter((booking) => {
      const assign = assigns.find(
        (a) => a.booking_id.toString() === booking._id.toString()
      );
      const matchesStatus = status ? assign?.status === status : true;
      const matchesDate =
        startDate && endDate
          ? new Date(booking.date) >= new Date(startDate) &&
            new Date(booking.date) <= new Date(endDate)
          : true;
      return matchesStatus && matchesDate;
    })
    .map((booking) => {
      const assign = assigns.find(
        (a) => a.booking_id.toString() === booking._id.toString()
      );
      return {
        booking_id: booking.booking_id,
        vehicle: booking.vehicle_id,
        service: booking.service_id,
        date: booking.booking_date,
        status: assign?.status || "unassigned",
        mechanic: assign?.user_id || null,
      };
    });
};

// Get service history for one vehicle
export const getServiceHistoryByVehicle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;
    const { status, startDate, endDate } = req.query;

    const bookings = await Booking.find({ vehicle_id: vehicleId })
      .populate("vehicle_id")
      .populate("service_id")
      .lean();

    const assigns = await Assign.find({
      booking_id: { $in: bookings.map((b) => b._id) },
    })
      .populate("user_id", "fullName email user_id")
      .lean();

    const history = applyFilters(
      bookings,
      assigns,
      status as string,
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      status: "success",
      result: history.length,
      history,
    });
  }
);

export const getServiceHistoryByCustomer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { status, startDate, endDate } = req.query;

    const vehicles = await Vehicle.find({ owner: userId }).lean();
    const vehicleIds = vehicles.map((v) => v._id);

    const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
      .populate("vehicle_id")
      .populate("service_id")
      .lean();

    const assigns = await Assign.find({
      booking_id: { $in: bookings.map((b) => b._id) },
    })
      .populate("user_id", "fullName email")
      .lean();

    const history = applyFilters(
      bookings,
      assigns,
      status as string,
      startDate as string,
      endDate as string
    );
    res.status(200).json({
      status: "success",
      result: history.length,
      history,
    });
  }
);

// Get service history by mechanic
export const getServiceHistoryByMechanic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { status, startDate, endDate } = req.query;

  try {
    const assigns = await Assign.find({ user_id: userId })
      .populate({ path: "booking_id", populate: ["vehicle_id", "service_id"] })
      .populate("user_id", "fullName email")
      .lean();

    const bookings = assigns.map((a) => a.booking_id);
    const history = applyFilters(
      bookings,
      assigns,
      status as string,
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      status: "success",
      result: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceHistoryByService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceId } = req.params;
    const { status, startDate, endDate } = req.query;

    const bookings = await Booking.find({ service_id: serviceId })
      .populate({
        path: "vehicle_id",
        populate: { path: "owner", select: "fullName email" },
      })
      .populate("service_id")
      .lean();

    const assigns = await Assign.find({
      booking_id: { $in: bookings.map((b) => b._id) },
    })
      .populate("user_id", "fullName email")
      .lean();

    const history = applyFilters(
      bookings,
      assigns,
      status as string,
      startDate as string,
      endDate as string
    );
    res.status(200).json({
      status: "success",
      result: history.length,
      history,
    });
  }
);
