import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/protect";
import notificationModel from "../models/notification.model";
import catchAsync from "../utils/catchAsync";

export const getUserNotifications = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const notifications = await notificationModel
      .find({ user_id: userId })
      .sort({ createdAt: -1 });
    res.json({
      status: "success",
      result: notifications.length,
      notifications,
    });
  }
);

// PATCH /api/notifications/:id/seen
export const markAsSeen = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    await notificationModel.findByIdAndUpdate(req.params.id, { seen: true });
    res.json({ message: "Notification marked as seen" });
  }
);

// PATH marks all notifications as seen
export const markAllAsSeen = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    await notificationModel.updateMany(
      { user_id: req.user?.id },
      { seen: true }
    );
    res.json({ message: "All notifications marked as seen" });
  }
);

// DELETE /api/notifications/:id
export const deleteNotification = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const deletedNotification = await notificationModel.findByIdAndDelete(
      req.params.id
    );
    res.json({ message: "Notification deleted successfully" });
  }
);

// DELETE all /api/notifications/all
export const deleteAllNotifications = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const deletedNotifications = await notificationModel.deleteMany({
      user_id: req.user?.id,
    });
    res.json({ message: "All notifications deleted successfully" });
  }
);
