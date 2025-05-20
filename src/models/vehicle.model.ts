import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle {
  owner?: mongoose.Types.ObjectId;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licence_plate?: string;
  color?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    vin: {
      type: String,
    },
    licence_plate: {
      type: String,
    },
    color: {
      type: String,
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

const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;
