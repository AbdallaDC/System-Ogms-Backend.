import Notification from "../models/notification.model";
import AppError from "./AppError";

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
  } catch (error) {
    console.log("error", error);
    throw new AppError("Failed to create notification", 400);
  }
};
