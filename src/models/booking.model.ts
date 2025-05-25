import mongoose, { Schema, model } from "mongoose";

export interface IBooking {
  user_id: mongoose.Types.ObjectId;
  vehicle_id: mongoose.Types.ObjectId;
  service_id: mongoose.Types.ObjectId;
  booking_date: Date;
  status: "pending" | "completed" | "cancelled";
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  },
  { timestamps: true }
);

const Booking = model<IBooking>("Booking", bookingSchema);

export default Booking;
