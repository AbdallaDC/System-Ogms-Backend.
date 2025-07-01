import mongoose from "mongoose";
import { Schema } from "mongoose";
import Counter from "./couner.model";
import { IUsedInventory } from "./booking.model";

export interface ITransferHistory {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  reason: string;
  date: Date;
}

const usedInventorySchema = new mongoose.Schema<IUsedInventory>(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      // required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

interface IAssign {
  assign_id: string;
  user_id: mongoose.Types.ObjectId;
  booking_id: mongoose.Types.ObjectId;
  status: "pending" | "assigned" | "completed" | "cancelled";
  createdBy?: string;
  transferredBy?: string;
  transferReason?: string;
  transferHistory: ITransferHistory[];
  usedInventory: IUsedInventory[];
}

const assignSchema = new Schema<IAssign>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "completed", "cancelled"],
      default: "pending",
    },
    createdBy: {
      type: String,
    },
    transferredBy: {
      type: String,
    },
    transferReason: {
      type: String,
    },
    transferHistory: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    usedInventory: [usedInventorySchema],

    assign_id: {
      type: String,
    },
  },
  { timestamps: true }
);

assignSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Assign" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const prefix = "ASN";
    const padded = counter.seq.toString().padStart(3, "0");
    this.assign_id = `${prefix}${padded}`;
  }
  next();
});

const Assign = mongoose.model<IAssign>("Assign", assignSchema);

export default Assign;
