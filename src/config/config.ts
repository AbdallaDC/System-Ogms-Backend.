import dotenv from "dotenv";

dotenv.config();

export const DB_URI = process.env.DB_URI as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;

export const JWT_SECRET = process.env.JWT_SECRET!;

export const WAAFI_MERCHANT_UID = process.env.WAAFI_MERCHANT_UID!;
export const WAAFI_API_USER_ID = process.env.WAAFI_API_USER_ID!;
export const WAAFI_API_KEY = process.env.WAAFI_API_KEY!;
