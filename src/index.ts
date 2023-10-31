import express, { Request } from "express";
import { handleErrors } from "./middlewares/errors";
import { ErrorHandler } from "./services/ErrorHandler";
import { Db } from "./services/Db";
import userRoutes from "./routes/users";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

// Make primsa available on req object
app.use((req: Request, res, next) => {
  req.prisma = new PrismaClient();
  req.db = Db.getInstance(req.prisma);
  next();
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

// Middleware
app.use(cookieParser());
app.use(express.json());

// API Routes (v0.1)
app.use("/api/v0.1", userRoutes);

// Handle non-existent route errors
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

// Handle manually caught errors
app.use(handleErrors);

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handle unhandled promise rejection
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down server due to unhandeled promise rejection");
  server.close(() => process.exit(1));
});
