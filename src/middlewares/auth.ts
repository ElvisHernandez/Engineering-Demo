import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { handleAsyncError } from "./errors";
import { ErrorHandler } from "../services/ErrorHandler";
import { getEnvVar } from "../utils/getEnvVar";
import { z } from "zod";

const DecodedTokenSchema = z.object({
  email: z.string(),
});

export const isAuthenticated = handleAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers?.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ErrorHandler("Login first to access this resource", 401));
    }

    const decoded = jwt.verify(token, getEnvVar("JWT_SECRET"));
    const { email } = DecodedTokenSchema.parse(decoded);
    const user = await req.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next(new ErrorHandler("Invalid token", 401));
    }

    req.user = user;

    next();
  },
);
