import mongoose, { Schema, model } from "mongoose";
import Counter from "./couner.model";

export interface IService {
  service_name: string;
  description: string;
  price: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // usedInventory?: {
  //   item: mongoose.Types.ObjectId;
  //   quantity: number;
  // };
  service_id?: string;
}

const serviceSchema = new Schema<IService>(
  {
    service_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    // usedInventory: [
    //   {
    //     item: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Inventory",
    //     },
    //     quantity: Number,
    //   },
    // ],
    service_id: {
      type: String,
    },
  },
  { timestamps: true }
);

serviceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Service" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const prefix = "SRV";
    const padded = counter.seq.toString().padStart(3, "0");
    this.service_id = `${prefix}${padded}`;
  }
  next();
});

serviceSchema.set("toJSON", { virtuals: true });
serviceSchema.set("toObject", { virtuals: true });

serviceSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "service_id",
});

const Service = model<IService>("Service", serviceSchema);
export default Service;
