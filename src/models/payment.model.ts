// payment.model.ts
import mongoose, { Document } from "mongoose";
import Counter from "./couner.model";

export interface IPayment extends Document {
  orderId: string;
  issuerTransactionId: string;
  accountType: string;
  payment_id: string;
  user_id: mongoose.Types.ObjectId;
  service_id?: mongoose.Types.ObjectId;
  booking_id?: mongoose.Types.ObjectId;

  inventoryItems?: {
    type: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId;
          ref: "Inventory";
          required: true;
        };
        quantity: { type: Number; default: 1 };
      }
    ];
    default: [];
  };

  phone: string;
  method: "evc" | "zaad" | "sahal";
  item_price?: number;
  labour_fee?: number;
  amount: number;
  status: "pending" | "paid" | "failed";
  referenceId: string;
  transactionId?: string;
  responseMessage?: string;
  paid_at?: Date;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    orderId: { type: String, default: null },
    issuerTransactionId: { type: String, default: null },
    accountType: { type: String, default: null },
    payment_id: { type: String, unique: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      // required: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      // required: true,
    },
    inventoryItems: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    phone: { type: String, default: null },
    method: { type: String, enum: ["evc", "zaad", "sahal"], default: null },
    item_price: { type: Number },
    labour_fee: { type: Number },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    description: { type: String, default: null },
    referenceId: { type: String, required: true },
    transactionId: { type: String, default: null },
    responseMessage: { type: String, default: null },
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
