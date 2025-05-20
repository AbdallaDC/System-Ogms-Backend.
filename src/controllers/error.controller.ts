import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  path?: string;
  value?: string;
  errors?: { [key: string]: { message: string } };
  keyValue?: Record<string, any>;
  code?: number;
}

const sendErrDev = (err: CustomError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: CustomError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("Error: ", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const handleCastErrorDb = (err: CustomError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationError = (err: CustomError): AppError => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDb = (err: CustomError): AppError | undefined => {
  if (err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} "${value}" already exists. Please use another value!`;
    return new AppError(message, 400);
  }
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again!", 401);

const handleTokenExpired = (): AppError =>
  new AppError("Your token has expired! Please log in again.", 401);

const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") err = handleCastErrorDb(err);
    if (err.name === "ValidationError") err = handleValidationError(err);
    if (err.code === 11000) err = handleDuplicateFieldDb(err) || err;
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleTokenExpired();

    sendErrorProd(err, res);
  } else {
    sendErrDev(err, res);
  }
};

export default globalErrorHandler;
