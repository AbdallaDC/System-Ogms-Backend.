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

export const generateInvoicePDF = async (
  paymentId: string
): Promise<Buffer> => {
  const payment = await Payment.findById(paymentId)
    .populate("booking_id")
    .populate("service_id")
    .populate("user_id");

  //   console.log("payment from generateInvoicePDF", payment);

  if (!payment) throw new AppError("Payment not found", 404);

  const assign = await Assign.findOne({
    booking_id: payment.booking_id,
  })
    .populate("usedInventory.item")
    .populate("booking_id");

  if (!assign) throw new AppError("Assign not found", 404);

  const templatePath = path.join(
    __dirname,
    "../templates/invoice.template.ejs"
  );
  const template = fs.readFileSync(templatePath, "utf-8");
  // console.log("html", {
  //   companyName: "Garage Pro",
  //   payment,
  //   booking,
  //   customer: payment.user_id,
  //   service: payment.service_id,
  //   // items: booking.usedInventory,
  //   total: payment.amount,
  //   labourFee: payment.labour_fee,
  //   itemPrice: payment.item_price,
  //   date: payment.paid_at,
  //   invoiceId: payment.payment_id,
  // });

  const html = ejs.render(template, {
    companyName: "Garage Pro",
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
  });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  //   const pdfBuffer = await page.pdf({ format: 'A4' });
  const pdfUint8Array = await page.pdf({ format: "A4" });
  const pdfBuffer = Buffer.from(pdfUint8Array);

  await browser.close();

  return pdfBuffer;
};
