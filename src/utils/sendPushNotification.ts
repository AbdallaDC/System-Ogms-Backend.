import { FCM_SERVER_KEY } from "../config";
import axios from "axios";

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string
) => {
  if (!token) return;

  const response = await axios.post(
    "https://fcm.googleapis.com/fcm/send",
    {
      to: token,
      notification: {
        title,
        body,
      },
    },
    {
      headers: {
        Authorization: `key=${FCM_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.data;
  console.log("Push sent:", result);
};
