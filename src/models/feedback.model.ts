// feedback.model.ts
import mongoose from "mongoose";
import Counter from "./couner.model";

const feedbackSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // only one feedback per booking
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mechanic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    feedback_id: {
      type: String,
    },
  },
  { timestamps: true }
);

feedbackSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Feedback" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const prefix = "FBK";
    const padded = counter.seq.toString().padStart(3, "0");
    this.feedback_id = `${prefix}${padded}`;
  }
  next();
});

export default mongoose.model("Feedback", feedbackSchema);
