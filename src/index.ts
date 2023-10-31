import express from "express";
import { handleErrors, handleAsyncError } from "./middlewares/errors";
import { ErrorHandler } from "./services/ErrorHandler";
// import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
// const prisma = new PrismaClient();

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

app.use(express.json());

app.get(
  "/test",
  handleAsyncError(async (req, res, next) => {
    console.log(process.env.NODE_ENV);
    return next(new ErrorHandler("Test error", 500));
    //   res.json({ msg: "hello, world" });
  }),
);

// Handle non-existent route errors
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

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
