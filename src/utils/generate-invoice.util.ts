// generate-invoice.util.ts
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import ejs from "ejs";
import Booking from "../models/booking.model";
import Payment from "../models/payment.model";
import User from "../models/user.model";
import Service from "../models/service.model";
import Inventory from "../models/inventory.model";
import AppError from "../utils/AppError";
import Assign from "../models/assign.model";

// export const getInvoiceData = async (paymentId: string) => {
//   const payment = await Payment.findById(paymentId)
//     .populate("booking_id")
//     .populate("service_id")
//     .populate("user_id");

//   if (!payment) throw new AppError("Payment not found", 404);

//   const assign = await Assign.findOne({
//     booking_id: payment.booking_id,
//   })
//     .populate("usedInventory.item")
//     .populate("booking_id");

//   if (!assign) throw new AppError("Assign not found", 404);

//   return {
//     companyName: "Garage Pro",
//     payment,
//     booking: assign.booking_id,
//     customer: payment.user_id,
//     service: payment.service_id,
//     items: assign.usedInventory,
//     total: payment.amount,
//     labourFee: payment.labour_fee,
//     itemPrice: payment.item_price,
//     date: payment.paid_at,
//     invoiceId: payment.payment_id,
//   };
// };

export const getInvoiceData = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId)
    .populate("booking_id")
    .populate("service_id")
    .populate("user_id")
    .populate("inventoryItems.item");

  if (!payment) throw new AppError("Payment not found", 404);

  // Case 1: Booking-based
  if (payment.booking_id) {
    const assign = await Assign.findOne({
      booking_id: payment.booking_id,
    })
      .populate("usedInventory.item")
      .populate("booking_id");

    if (!assign) throw new AppError("Assign not found", 404);

    return {
      companyName: "Garage Pro",
      type: "booking",
      payment,
      booking: assign.booking_id,
      customer: payment.user_id,
      service: payment.service_id,
      items: assign.usedInventory,
      total: payment.amount,
      labourFee: payment.labour_fee,
      itemPrice: payment.item_price,
      date: payment.paid_at,
      invoiceId: payment.payment_id,
    };
  }

  // Case 2: Inventory-only
  return {
    companyName: "Garage Pro",
    type: "inventory",
    payment,
    customer: payment.user_id,
    items: payment.inventoryItems,
    itemPrice: payment.item_price,
    total: payment.amount,
    date: payment.paid_at,
    invoiceId: payment.payment_id,
  };
};
