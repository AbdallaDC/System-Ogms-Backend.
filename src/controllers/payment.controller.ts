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

export const createPayment = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { booking_id, phone, method } = req.body;

    if (!booking_id || !phone || !method) {
      return next(
        new AppError("Please provide booking_id, phone, and method", 400)
      );
    }

    const booking: any = await Booking.findById(booking_id).populate({
      path: "service_id",
      select: "service_name service_id price",
    });

    if (!booking) return next(new AppError("Booking not found", 404));

    // check if booking is paid
    // const existing = await Payment.findOne({ booking_id, status: "paid" });
    // if (existing) {
    //   return next(new AppError("This booking has already been paid", 400));
    // }

    const counter = await Counter.findOne({ model: "Payment" });
    const payment_id = `PAY${counter?.seq}`;

    const referenceId = `REF${Date.now()}`;

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
          referenceId: "12334",
          // invoiceId: "7896504",
          //   referenceId,
          invoiceId: payment_id,
          amount: 0.01,
          //   amount: booking?.service_id?.price,
          currency: "USD",
          description: `Payment for ${booking.service_id.service_name} service was made successfully!`,
        },
      },
    };

    // Call WaafiPay API
    const waafiRes = await axios.post(
      "https://api.waafipay.com/asm",
      waafiPayload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = waafiRes.data;

    console.log("result", result);
    if (result.responseCode !== "2001") {
      return next(new AppError(`${result.params.description}`, 400));
    }

    const status = result.responseCode === "2001" ? "paid" : "failed";

    if (status === "paid") {
      await Booking.findByIdAndUpdate(booking_id, { status: "paid" });
    }

    const payment = await Payment.create({
      payment_id,
      user_id: req.user?.id,
      service_id: booking?.service_id?._id,
      booking_id,
      phone,
      method,
      amount: booking?.service_id.price,
      status,
      referenceId,
      transactionId: result.params.transactionId || null,
      responseMessage: result.responseMsg,
      paid_at: status === "paid" ? new Date() : undefined,
      orderId: result.params.orderId || null,
      issuerTransactionId: result.params.issuerTransactionId || null,
      accountType: result.params.accountType || null,
    });

    res.status(201).json({
      status: "success",
      data: payment,
    });
  }
);

// get all transaction
export const getAllTransactions = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await Payment.find()
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
