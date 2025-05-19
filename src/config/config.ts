import dotenv from "dotenv";

dotenv.config();

export const DB_URI = process.env.DB_URI as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;

export const JWT_SECRET = process.env.JWT_SECRET!;
