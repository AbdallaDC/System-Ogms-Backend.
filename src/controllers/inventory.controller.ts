import { NextFunction, Response } from "express";
import Inventory from "../models/inventory.model";
import { AuthRequest } from "../middleware/protect";
import AppError from "../utils/AppError";

export const createInventoryItem = async (req: AuthRequest, res: Response) => {
  const item = await Inventory.create(req.body);
  res.status(201).json(item);
};

export const getAllInventory = async (_req: AuthRequest, res: Response) => {
  const items = await Inventory.find().sort({ createdAt: -1 });
  res.status(200).json(items);
};

export const getInventoryById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) return next(new AppError("Item not found", 404));
  res.status(200).json(item);
};

export const updateInventoryItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const updated = await Inventory.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updated) return next(new AppError("Item not found", 404));
  res.status(200).json(updated);
};

export const deleteInventoryItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const deleted = await Inventory.findByIdAndDelete(id);
  if (!deleted) return next(new AppError("Item not found", 404));
  res.status(200).json({ message: "Item deleted successfully" });
};
