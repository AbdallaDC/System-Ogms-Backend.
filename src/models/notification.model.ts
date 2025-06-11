import mongoose from "mongoose";
import Counter from "./couner.model";

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    link: { type: String },
    seen: { type: Boolean, default: false },
    notification_id: { type: String, unique: true },
  },
  { timestamps: true }
);

notificationSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Notification" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const prefix = "NOTI";
    const padded = counter.seq.toString().padStart(3, "0");
    this.notification_id = `${prefix}${padded}`;
  }
  next();
});

export default mongoose.model("Notification", notificationSchema);
