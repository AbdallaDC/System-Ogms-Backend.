import Assign from "../models/assign.model";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middleware/protect";
import APIFeatures from "../utils/APIFeatures";
import User from "../models/user.model";
import Booking from "../models/booking.model";
import inventoryModel from "../models/inventory.model";
import { calculateBookingTotal } from "../utils/booking-total-calculator.utitl";
import { createNotification } from "../utils/createNotification";

export const createAssign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { booking_id, user_id, usedInventory } = req.body;

    if (!booking_id || !user_id || !Array.isArray(usedInventory)) {
      return next(new AppError("Missing required fields", 400));
    }

    const booking: any = await Booking.findById(booking_id)
      .populate({
        path: "user_id",
        select: "name email phone user_id",
      })
      .populate({
        path: "service_id",
        select: "service_name service_id price",
      });
    if (!booking) return next(new AppError("Booking not found", 404));

    // validate inventory items
    for (const entry of usedInventory) {
      const item = await inventoryModel.findById(entry.item);
      if (!item) {
        return next(
          new AppError(`Inventory item not found: ${entry.item}`, 404)
        );
      }
      if (item.quantity < entry.quantity) {
        return next(
          new AppError(
            `Not enough stock for ${item.name}: Available=${item.quantity}, Requested=${entry.quantity}`,
            400
          )
        );
      }
    }

    // Create assign record
    const assign = await Assign.create({
      booking_id,
      user_id,
      usedInventory,
      status: "assigned",
    });

    // Update booking status
    booking.status = "assigned";
    await booking.save();

    // Deduct inventory
    for (const entry of usedInventory) {
      await inventoryModel.findByIdAndUpdate(entry.item, {
        $inc: { quantity: -entry.quantity },
      });
    }

    // After assigning mechanic to booking, send notification
    if (user_id) {
      await createNotification({
        user_id,
        title: "new assign",
        message: `you have been assigned to ${booking.service_id.service_name} service`,
        type: "info",
        // link: `/mechanic/bookings/${booking._id}`,
      });
    }

    // send notification to customer
    if (booking.user_id) {
      await createNotification({
        user_id: booking.user_id,
        title: "booking assigned",
        message: "your booking has been assigned to a mechanic",
        type: "info",
      });
    }

    res.status(201).json({
      status: "success",
      data: assign,
    });
  }
);

export const updateAssignStatus = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return next(new AppError("Invalid status value", 400));
    }

    const assign = await Assign.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!assign) {
      return next(new AppError("Assigned work not found", 404));
    }

    const admins = await User.find({ role: "admin" });
    const booking: any = await Booking.findById(assign.booking_id).populate({
      path: "service_id",
      select: "service_name service_id price",
    });
    const customer = await User.findOne({
      _id: assign.user_id,
      role: "customer",
    });

    if (status === "completed") {
      if (!customer) return;
      await createNotification({
        user_id: customer._id.toString(),
        title: "work completed",
        message: `Mechanic ${assign.user_id} has completed work for your booking ${booking.service_id.service_name}`,
        type: "success",
        // link: `/customer/bookings/${booking._id}`,
      });
    }
    // send notification to admin

    for (const admin of admins) {
      switch (status) {
        case "completed":
          await createNotification({
            user_id: admin._id.toString(),
            title: "work completed",
            message: `Mechanic ${assign.user_id} has completed work for ${booking.service_id.service_name}`,
            type: "info",
            link: `/assignments/${assign._id}`,
          });
          break;
        case "cancelled":
          await createNotification({
            user_id: admin._id.toString(),
            title: "work cancelled",
            message: `Mechanic ${assign.user_id} has cancelled work for ${booking.service_id.service_name}`,
            type: "error",
            link: `/assignments/${assign._id}`,
          });
          break;
        case "pending":
          await createNotification({
            user_id: admin._id.toString(),
            title: "work pending",
            message: `Mechanic ${assign.user_id} has assigned work for ${booking.service_id.service_name}`,
            type: "warning",
            link: `/assignments/${assign._id}`,
          });
          break;
      }
    }

    res.status(200).json({
      status: "success",
      message: "Status updated successfully",
      data: assign,
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
        select: "name email phone user_id role",
      })
      .populate({
        path: "booking_id",
        select: "booking_date status service_id",
        populate: [
          {
            path: "service_id",
            select: "service_name service_id price",
          },
        ],
      })
      .populate({
        path: "transferHistory.from",
        select: "name user_id",
      })
      .populate({
        path: "transferHistory.to",
        select: "name user_id",
      })
      .populate({
        path: "usedInventory.item",
        select: "name price",
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
        select: "name email phone user_id",
      })
      .populate({
        path: "booking_id",
        select: "booking_date status service_id",
        populate: [
          {
            path: "service_id",
            select: "service_name service_id price",
          },
        ],
      })
      .populate({
        path: "transferHistory.from",
        select: "name user_id",
      })
      .populate({
        path: "transferHistory.to",
        select: "name user_id",
      })
      .populate({
        path: "usedInventory.item",
        select: "name price",
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

    const assign: any = await Assign.findById(req.params.id).populate({
      path: "user_id",
      select: "name email phone user_id",
    });

    if (!updatedAssign || !assign) {
      return next(new AppError("Assign not found!", 404));
    }

    const admins = await User.find({ role: "admin" });
    const booking: any = await Booking.findById(assign.booking_id).populate({
      path: "service_id",
      select: "service_name service_id price",
    });
    const customer = await User.findOne({
      _id: assign.user_id,
      role: "customer",
    });

    if (req.body.status === "completed") {
      if (!customer) return;
      await createNotification({
        user_id: customer._id.toString(),
        title: "work completed",
        message: `Mechanic ${assign.user_id.name} has completed work for your booking ${booking.service_id.service_name}`,
        type: "success",
        // link: `/customer/bookings/${booking._id}`,
      });
    }
    // send notification to admin

    for (const admin of admins) {
      switch (req.body.status) {
        case "completed":
          await createNotification({
            user_id: admin._id.toString(),
            title: "work completed",
            message: `Mechanic ${assign.user_id.name} has completed work for ${booking.service_id.service_name}`,
            type: "info",
            link: `/assignments/${assign._id}`,
          });
          break;
        case "cancelled":
          await createNotification({
            user_id: admin._id.toString(),
            title: "work cancelled",
            message: `Mechanic ${assign.user_id.name} has cancelled work for ${booking.service_id.service_name}`,
            type: "error",
            link: `/assignments/${assign._id}`,
          });
          break;
        case "pending":
          await createNotification({
            user_id: admin._id.toString(),
            title: "work pending",
            message: `Mechanic ${assign.user_id.name} has been updated status to pending  work for ${booking.service_id.service_name}`,
            type: "warning",
            link: `/assignments/${assign._id}`,
          });
          break;
      }
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
    })
      .populate({
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
        populate: [
          {
            path: "service_id",
            select: "service_name service_id price",
          },
        ],
      })
      .populate({
        path: "usedInventory.item",
        select: "name price",
      })
      .populate({
        path: "transferHistory.from",
        select: "name user_id",
      })
      .populate({
        path: "transferHistory.to",
        select: "name user_id",
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

// transfer assign
export const transferAssign = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params; // assign_id
  const { new_user_id, reason } = req.body;

  const assign: any = await Assign.findOne({ _id: id }).populate({
    path: "booking_id",
    select: "booking_date booking_id status service_id",
  });
  if (!assign) return next(new AppError("Assign not found", 404));

  const previousUser = assign.user_id;

  // check if user's id are same
  if (previousUser.toString() === new_user_id.toString()) {
    return next(new AppError("Cannot transfer to same user", 400));
  }

  console.log("previousUser", previousUser);
  console.log("new_user_id", new_user_id);

  // update assign
  assign.user_id = new_user_id;
  assign.transferredBy = req.user?.email;
  assign.transferReason = reason;

  assign.transferHistory.push({
    from: previousUser,
    to: new_user_id,
    reason,
    date: new Date(),
  });

  await assign.save();

  // send notification to new user
  await createNotification({
    user_id: new_user_id,
    title: "new assign",
    message: `you have been assigned to ${assign.booking_id?.booking_id} service transfered to you`,
    type: "info",
    // link: `/mechanic/bookings/${booking._id}`,
  });

  res.status(200).json({
    status: "success",
    message: `Assign transferred successfully!`,
    assign,
  });
};
