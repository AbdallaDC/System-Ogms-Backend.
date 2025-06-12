// middleware/prevent-inventory-deletion.ts
import { Request, Response, NextFunction } from "express";
import Assign from "../models/assign.model";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

export const preventInventoryDeletion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const itemId = req.params.id;

    const isUsed = await Assign.findOne({ "usedInventory.item": itemId });

    if (isUsed) {
      return next(
        new AppError("Cannot delete item. It's already used in a service.", 400)
      );
    }

    next();
  }
);
