import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../services/ErrorHandler";

export const handleErrors = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;

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
