import mongoose from "mongoose";
import { Schema } from "mongoose";

interface IAssign {
  user_id?: mongoose.Types.ObjectId;
  booking_id: mongoose.Types.ObjectId;
  status: "pending" | "completed" | "cancelled";
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const assignSchema = new Schema<IAssign>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
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

const Assign = mongoose.model<IAssign>("Assign", assignSchema);

export default Assign;
