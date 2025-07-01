// inventory.model.ts
import mongoose from "mongoose";
import Counter from "./couner.model";

export enum InventoryType {
  SPARE_PART = "spare-part",
  EQUIPMENT = "equipment",
  VEHICLE = "vehicle",
  TOOL = "tool",
}

const inventorySchema = new mongoose.Schema(
  {
    inventory_id: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(InventoryType),
      // required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: "pcs",
    },
    price: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Inventory" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const prefix = "INV";
    const padded = counter.seq.toString().padStart(3, "0");
    this.inventory_id = `${prefix}${padded}`;
  }
  next();
});

export default mongoose.model("Inventory", inventorySchema);
