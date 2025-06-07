import mongoose, { Schema, model } from "mongoose";
import Counter from "./couner.model";

export interface IBooking {
  user_id: mongoose.Types.ObjectId;
  vehicle_id: mongoose.Types.ObjectId;
  service_id: mongoose.Types.ObjectId;
  booking_date: Date;
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  booking_id?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    booking_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    booking_id: {
      type: String,
    },
  },
  { timestamps: true }
);

bookingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Booking" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const prefix = "BKG";
    const padded = counter.seq.toString().padStart(3, "0");
    this.booking_id = `${prefix}${padded}`;
  }
  next();
});

const Booking = model<IBooking>("Booking", bookingSchema);

export default Booking;
