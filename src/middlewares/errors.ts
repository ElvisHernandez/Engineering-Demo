import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../services/ErrorHandler";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const handleErrors = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;

  // handle bad btc address validation
  if (err.message.includes("has no matching Script")) {
    err = new ErrorHandler("Invalid BTC address. Please check format", 400);
  }

  // Bad request payload caused request to fail validation
  if (err instanceof ZodError) {
    err.statusCode = 400;
  }

  if (err instanceof PrismaClientKnownRequestError) {
    // Handle duplicate email error
    // @ts-ignore
    if (err.meta?.target?.includes("email")) {
      err = new ErrorHandler(`User with email already exists`, 400);
    }

    // @ts-ignore
    if (err.meta?.target?.includes("address")) {
      err = new ErrorHandler(`Address already exists`, 400);
    }
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "production") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const handleAsyncError =
  (func: MiddlewareFunction) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(func(req, res, next)).catch(next);
