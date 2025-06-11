// invoice.controller.ts
import { Request, Response, NextFunction } from "express";
import { generateInvoicePDF } from "../utils/generate-invoice.util";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

export const downloadInvoice = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;

    if (!paymentId) {
      return next(new AppError("Missing payment ID", 400));
    }

    const pdfBuffer = await generateInvoicePDF(paymentId);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${paymentId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
);
