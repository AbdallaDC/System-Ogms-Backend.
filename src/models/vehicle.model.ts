import mongoose, { Schema, Document } from "mongoose";
import Counter from "./couner.model";

export interface IVehicle {
  owner?: mongoose.Types.ObjectId;
  make: string;
  model: string;
  year: number;
  // vin?: string;
  // licence_plate?: string;
  // color?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  inventoryRef?: mongoose.Types.ObjectId;
  vehicle_id?: string;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    make: {
      type: String,
      // required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    // vin: {
    //   type: String,
    // },
    // licence_plate: {
    //   type: String,
    // },
    // color: {
    //   type: String,
    // },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    // inventoryRef: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Inventory",
    // },
    vehicle_id: {
      type: String,
    },
  },

  { timestamps: true }
);

vehicleSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Vehicle" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const prefix = "VEH";
    const padded = counter.seq.toString().padStart(3, "0");
    this.vehicle_id = `${prefix}${padded}`;
  }
  next();
});

const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;
