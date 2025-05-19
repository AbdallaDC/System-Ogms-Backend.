import mongoose from "mongoose";
import { DB_URI, DB_PASSWORD } from "./config";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI.replace("<db_password>", DB_PASSWORD));
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
