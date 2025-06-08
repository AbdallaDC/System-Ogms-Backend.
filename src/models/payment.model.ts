// payment.model.ts
import mongoose, { Document } from "mongoose";
import Counter from "./couner.model";

export interface IPayment extends Document {
  orderId: string;
  issuerTransactionId: string;
  accountType: string;
  payment_id: string;
  user_id: mongoose.Types.ObjectId;
  service_id: mongoose.Types.ObjectId;
  booking_id: mongoose.Types.ObjectId;
  phone: string;
  method: "evc" | "zaad" | "sahal";
  amount: number;
  status: "pending" | "paid" | "failed";
  referenceId: string;
  transactionId?: string;
  responseMessage?: string;
  paid_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    orderId: { type: String },
    issuerTransactionId: { type: String },
    accountType: { type: String },
    payment_id: { type: String, unique: true },
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
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    phone: { type: String, required: true },
    method: { type: String, enum: ["evc", "zaad", "sahal"], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    referenceId: { type: String, required: true },
    transactionId: { type: String },
    responseMessage: { type: String },
    paid_at: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Payment" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const prefix = "PAY";
    const padded = counter.seq.toString().padStart(3, "0");
    this.payment_id = `${prefix}${padded}`;
  }
  next();
});

export default mongoose.model<IPayment>("Payment", paymentSchema);
