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
import inventoryModel from "../models/inventory.model";

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
          amount: 0.01, // for testing purposes, use 0.01 to avoid real payment
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

// create payment for inventory
export const createPaymentForInventory = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { inventory_id, quantity = 1, phone, method } = req.body;

    // 1. Hubi user-ka jira
    const user = await User.findById(req.user?.id);
    if (!user) return next(new AppError("User not found", 404));

    // 2. Validation input
    if (!inventory_id || !phone || !method) {
      return next(
        new AppError("Please provide inventory_id, phone, and method", 400)
      );
    }

    // 3. Hel inventory-ga la gadayo
    const inventory: any = await inventoryModel.findById(inventory_id);
    // console.log("inventory", inventory);
    if (!inventory) return next(new AppError("Inventory not found", 404));

    // check inventory quantity
    if (inventory.quantity < quantity) {
      return next(new AppError(`Not enough stock for ${inventory.name}`, 400));
    }

    // 4. Xisaabi qiimaha
    // const item_price = inventory.price * quantity;
    const item_price = inventory.price;
    const amount = item_price * quantity;

    console.log("amount", amount);

    // 5. U diyaari WaafiPay
    const counter = await Counter.findOne({ model: "Payment" });
    const payment_id = `PAY${counter?.seq}`;
    const referenceId = `REF${Date.now()}`;

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
          referenceId,
          invoiceId: payment_id,
          // amount: amount,
          amount: 0.01, // for testing purposes
          currency: "USD",
          description: `Payment for purchasing inventory item '${inventory.name}'`,
        },
      },
    };

    try {
      // 6. Call WaafiPay
      const waafiRes = await axios.post(
        "https://api.waafipay.com/asm",
        waafiPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = waafiRes.data;

      if (result.responseCode !== "2001") {
        return next(new AppError(`${result.params.description}`, 400));
      }

      const status = result.responseCode === "2001" ? "paid" : "failed";

      // 7. Update Inventory quantity
      if (status === "paid") {
        await inventoryModel.findByIdAndUpdate(inventory_id, {
          $inc: { quantity: -quantity },
        });
      }

      // 8. Save Payment
      const payment = await Payment.create({
        payment_id,
        user_id: req.user?.id,
        inventoryItems: [{ item: inventory_id, quantity }],
        phone,
        method,
        item_price,
        amount,
        status,
        referenceId,
        transactionId: result.params.transactionId || null,
        responseMessage: result.params.responseMessage || null,
        paid_at: status === "paid" ? new Date() : undefined,
        orderId: result.params.orderId || null,
        issuerTransactionId: result.params.issuerTransactionId || null,
        accountType: result.params.accountType || null,
        description: inventory.description,
      });

      console.log("payment", payment);

      // 9. Notify Admins
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await createNotification({
          user_id: admin._id.toString(),
          title: "Inventory Purchased",
          message: `Item '${inventory.name}' has been purchased by ${user.name}`,
          type: "success",
          link: `/transactions/${payment._id}`,
        });
      }

      // 10. Send Response
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

// payment for multiple inventory items
// export const createPaymentForInventory = catchAsync(
//   async (req: AuthRequest, res: Response, next: NextFunction) => {
//     const { inventoryItems, phone, method } = req.body;

//     // 1. Hubi user
//     const user = await User.findById(req.user?.id);
//     if (!user) return next(new AppError("User not found", 404));

//     // 2. Validate inputs
//     if (
//       !inventoryItems ||
//       !Array.isArray(inventoryItems) ||
//       inventoryItems.length === 0
//     ) {
//       return next(
//         new AppError("Please provide at least one inventory item", 400)
//       );
//     }
//     if (!phone || !method) {
//       return next(new AppError("Phone and payment method are required", 400));
//     }

//     // 3. Xisaabi total + description
//     let item_price = 0;
//     const populatedItems: any[] = [];

//     for (const entry of inventoryItems) {
//       const item = await inventoryModel.findById(entry.item);
//       if (!item) throw new AppError(`Item not found: ${entry.item}`, 404);

//       const qty = entry.quantity || 1;
//       item_price += item.price * qty;

//       populatedItems.push({ item, quantity: qty });
//     }

//     const amount = item_price;

//     const counter = await Counter.findOne({ model: "Payment" });
//     const payment_id = `PAY${counter?.seq}`;
//     const referenceId = `REF${Date.now()}`;

//     const description = populatedItems
//       .map((p) => `${p.item.name} x${p.quantity}`)
//       .join(", ");

//     // 4. Waafi Payload
//     const waafiPayload = {
//       schemaVersion: "1.0",
//       requestId: "10111331033",
//       timestamp: new Date().toISOString(),
//       channelName: "WEB",
//       serviceName: "API_PURCHASE",
//       serviceParams: {
//         merchantUid: WAAFI_MERCHANT_UID,
//         apiUserId: WAAFI_API_USER_ID,
//         apiKey: WAAFI_API_KEY,
//         paymentMethod: "mwallet_account",
//         payerInfo: {
//           accountNo: phone,
//         },
//         transactionInfo: {
//           referenceId,
//           invoiceId: payment_id,
//           amount,
//           currency: "USD",
//           description: `Items purchased: ${description}`,
//         },
//       },
//     };

//     // 5. Call WaafiPay
//     const waafiRes = await axios.post(
//       "https://api.waafipay.com/asm",
//       waafiPayload,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     const result = waafiRes.data;
//     if (result.responseCode !== "2001") {
//       return next(new AppError(`${result.params.description}`, 400));
//     }

//     const status = "paid";

//     // 6. Reduce quantities
//     for (const { item, quantity } of populatedItems) {
//       await inventoryModel.findByIdAndUpdate(item._id, {
//         $inc: { quantity: -quantity },
//       });
//     }

//     // 7. Save Payment
//     const payment = await Payment.create({
//       payment_id,
//       user_id: req.user?.id,
//       inventoryItems,
//       phone,
//       method,
//       item_price,
//       amount,
//       status,
//       referenceId,
//       transactionId: result.params.transactionId || null,
//       responseMessage: result.params.responseMessage || null,
//       paid_at: new Date(),
//       orderId: result.params.orderId || null,
//       issuerTransactionId: result.params.issuerTransactionId || null,
//       accountType: result.params.accountType || null,
//       description,
//     });

//     // 8. Notify admins
//     const admins = await User.find({ role: "admin" });
//     for (const admin of admins) {
//       await createNotification({
//         user_id: admin._id.toString(),
//         title: "Multiple Inventory Payment",
//         message: `User ${user.name} purchased ${populatedItems.length} items.`,
//         type: "success",
//         link: `/transactions/${payment._id}`,
//       });
//     }

//     res.status(201).json({
//       status: "success",
//       data: payment,
//     });
//   }
// );

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
      })
      .populate({
        path: "inventoryItems.item",
        select: "name price",
      })
      .lean()
      .sort({ createdAt: -1 });

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
      })
      .populate({
        path: "inventoryItems.item",
        select: "name price",
      })
      .lean()
      .sort({ createdAt: -1 });

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
        // select: "service_name service_id price",
      })
      .populate({
        path: "user_id",
        // select: "name email phone user_id",
      })
      .populate({
        path: "booking_id",
        // select: "booking_date status service_id vehicle_id",
      })
      .populate({
        path: "inventoryItems.item",
        select: "name price",
      })
      .lean()
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      result: transactions.length,
      transactions,
    });
  }
);

// payment report
export const getPaymentReport = catchAsync(async (req, res, next) => {
  const { status, type, method, from, to, user, phone, service } = req.query;

  const match: any = {};

  if (status) match.status = status;
  if (type) match.type = type;
  if (method) match.method = method;
  if (user) match.user_id = user;
  if (phone) match.phone = phone;
  if (service) match.service_id = service;

  // if (from && to) {
  //   match.createdAt = {
  //     $gte: new Date(from as string),
  //     $lte: new Date(to as string),
  //   };
  // }
  if (from && to) {
    match.createdAt = {
      $gte: new Date(from as string),
      $lte: new Date(new Date(to as string).setHours(23, 59, 59, 999)),
    };
  }

  // 1. Get filtered payments
  const payments = await Payment.find(match)
    .populate("user_id", "name email")
    .populate("service_id", "service_name")
    .populate("inventoryItems.item", "name price")
    .sort({ createdAt: -1 });

  // 2. Get total amount
  const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  res.status(200).json({
    status: "success",
    count: payments.length,
    totalAmount: total,
    data: payments,
  });
});
