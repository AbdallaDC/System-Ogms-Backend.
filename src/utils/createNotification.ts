import Notification from "../models/notification.model";
import User from "../models/user.model";
import AppError from "./AppError";
import { sendPushNotification } from "./sendPushNotification";

export const createNotification = async ({
  user_id,
  title,
  message,
  type = "info",
  link = "",
}: {
  user_id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}) => {
  try {
    await Notification.create({ user_id, title, message, type, link });
    // Send push notification if token exists
    const user = await User.findById(user_id);
    if (user?.pushNotificationToken) {
      await sendPushNotification(user.pushNotificationToken, title, message);
    }
  } catch (error) {
    console.log("error", error);
    throw new AppError("Failed to create notification", 400);
  }
};
