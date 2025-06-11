// payment.controller.ts
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import Payment from "../models/payment.model";
import Service from "../models/service.model";
import { AuthRequest } from "../middleware/protect";
import AppError from "../utils/AppError";
import Counter from "../models/couner.model";
import {
  WAAFI_API_KEY,
  WAAFI_API_USER_ID,
  WAAFI_MERCHANT_UID,
} from "../config";
import Booking from "../models/booking.model";
import catchAsync from "../utils/catchAsync";
import { format, startOfDay, endOfDay } from "date-fns";
import { calculateBookingTotal } from "../utils/booking-total-calculator.utitl";
import User from "../models/user.model";
import Assign from "../models/assign.model";
import { createNotification } from "../utils/createNotification";

export const createPayment = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { booking_id, phone, method } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!booking_id || !phone || !method) {
      return next(
        new AppError("Please provide booking_id, phone, and method", 400)
      );
    }

    // check if booking is assigned to user
    // const assign = await Assign.findOne({
    //   booking_id,
    // });
    // console.log("assign", assign);

    // if (assign?.status !== "assigned") {
    //   return next(
    //     new AppError(
    //       "Booking not assigned to mechanic yet, please hold on",
    //       404
    //     )
    //   );
    // }

    const booking: any = await Booking.findById(booking_id).populate({
      path: "service_id",
      select: "service_name service_id price",
    });

    // console.log("booking", booking);

    if (!booking) return next(new AppError("Booking not found", 404));

    // check if booking is paid
    const existing = await Payment.findOne({ booking_id, status: "paid" });
    if (existing) {
      return next(new AppError("This booking has already been paid", 400));
    }

    const counter = await Counter.findOne({ model: "Payment" });
    const payment_id = `PAY${counter?.seq}`;

    const referenceId = `REF${Date.now()}`;
    const totals = await calculateBookingTotal(booking_id);
    console.log("totals", totals);

    // Build WaafiPay Payload
    const waafiPayload = {
      schemaVersion: "1.0",
      requestId: "10111331033",
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: WAAFI_MERCHANT_UID,
        apiUserId: WAAFI_API_USER_ID,
        apiKey: WAAFI_API_KEY,
        paymentMethod: "mwallet_account",
        payerInfo: {
          accountNo: phone,
        },
        transactionInfo: {
          // referenceId: "12334",
          // invoiceId: "7896504",
          referenceId,
          invoiceId: payment_id,
          amount: 0.01,
          // amount: totals.total,
          currency: "USD",
          description: `Payment for ${booking.service_id.service_name} service was made successfully!`,
        },
      },
    };
    try {
      // Call WaafiPay API
      const waafiRes = await axios.post(
        "https://api.waafipay.com/asm",
        waafiPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = waafiRes.data;

      // console.log("result", result);
      if (result.responseCode !== "2001") {
        return next(new AppError(`${result.params.description}`, 400));
      }

      const status = result.responseCode === "2001" ? "paid" : "failed";

      if (status === "paid") {
        await Booking.findByIdAndUpdate(booking_id, { status: "completed" });
      }

      const payment = await Payment.create({
        payment_id,
        user_id: req.user?.id,
        service_id: booking?.service_id?._id,
        booking_id,
        phone,
        method,
        item_price: totals.inventoryTotal,
        labour_fee: totals.servicePrice,
        amount: totals.total,
        status,
        referenceId,
        transactionId: result.params.transactionId || null,
        responseMessage: result.responseMsg,
        paid_at: status === "paid" ? new Date() : undefined,
        orderId: result.params.orderId || null,
        issuerTransactionId: result.params.issuerTransactionId || null,
        accountType: result.params.accountType || null,
      });
      // send notification to admin
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await createNotification({
          user_id: admin._id.toString(),
          title: "new payment",
          message: `Booking ${booking.booking_id} for service '${booking.service_id.service_name}' has been paid`,
          type: "success",
          link: `/transactions/${payment._id}`,
        });
      }

      res.status(201).json({
        status: "success",
        data: payment,
      });
    } catch (error) {
      console.log("error", error);
      return next(new AppError("Payment failed", 400));
    }
  }
);

// get all transaction
export const getAllTransactions = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate, phone } = req.query;

    let filters: any = {};

    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      if (start > end) {
        return next(new AppError("Start date must be less than end date", 400));
      }

      filters.createdAt = { $gte: start, $lte: end };
    }

    if (phone) {
      filters.phone = phone;
    }

    // console.log("filters", filters);

    const transactions = await Payment.find(filters)
      .populate({
        path: "service_id",
        select: "service_name service_id price",
      })
      .populate({
        path: "user_id",
        select: "-createdAt -updatedAt -__v",
      })
      .populate({
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
      });

    res.status(200).json({
      status: "success",
      result: transactions.length,
      transactions,
    });
  }
);

export const getSingleTransactionById = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await Payment.findById(req.params.id)
      .populate({
        path: "service_id",
        select: "service_name service_id price",
      })
      .populate({
        path: "user_id",
        select: "name email phone user_id",
      })
      .populate({
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
      });

    res.status(200).json({
      status: "success",
      transactions,
    });
  }
);

export const getTransActionsByUserId = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await Payment.find({
      user_id: req?.user?.id,
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
        path: "booking_id",
        select: "booking_date status service_id vehicle_id",
      });

    res.status(200).json({
      status: "success",
      result: transactions.length,
      transactions,
    });
  }
);
