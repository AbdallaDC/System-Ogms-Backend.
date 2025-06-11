import mongoose, { Schema, model } from "mongoose";
import Counter from "./couner.model";

// export interface IBooking {
//   user_id: mongoose.Types.ObjectId;
//   vehicle_id: mongoose.Types.ObjectId;
//   service_id: mongoose.Types.ObjectId;
//   booking_date: Date;
//   status:
//     | "pending"
//     | "assigned"
//     | "in-progress"
//     | "completed"
//     | "cancelled"
//     | "paid";
//   createdBy?: string;
//   updatedBy?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
//   booking_id?: string;
// }

// const bookingSchema = new Schema<IBooking>(
//   {
//     user_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     vehicle_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vehicle",
//       required: true,
//     },
//     service_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Service",
//       required: true,
//     },
//     booking_date: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       default: "pending",
//     },
//     createdBy: {
//       type: String,
//     },
//     updatedBy: {
//       type: String,
//     },
//     booking_id: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// booking.model.ts

export interface IUsedInventory {
  item: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IBooking extends Document {
  booking_id: string;
  user_id: mongoose.Types.ObjectId;
  service_id: mongoose.Types.ObjectId;
  // usedInventory: IUsedInventory[];
  booking_date: Date;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const usedInventorySchema = new mongoose.Schema<IUsedInventory>(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    booking_id: { type: String, unique: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    // usedInventory: [usedInventorySchema],
    booking_date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
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

export default mongoose.model<IBooking>("Booking", bookingSchema);
