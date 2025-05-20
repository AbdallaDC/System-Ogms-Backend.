import mongoose, { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
import validator from "validator";

type Role = "admin" | "mechanic" | "customer";

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  is_active: boolean;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // methods
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      // minlength: 8,
      // maxlength: 50,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // minlength: 10,
      // maxlength: 15,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "mechanic", "customer"],
      default: "customer",
    },
    address: {
      type: String,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});
// Compare password with saved password
userSchema.methods.comparePassword = async function (password: string) {
  return await bcryptjs.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    role: this.role,
    email: this.email,
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

const User = model<IUser>("User", userSchema);

export default User;
