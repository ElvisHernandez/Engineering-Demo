import express from "express";
import { ErrorHandlingMiddleware } from "./middlewares/errors";
import { ErrorHandler } from "./services/ErrorHandler";
// import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
// const prisma = new PrismaClient();

app.use(express.json());

app.get("/test", (req, res, next) => {
  console.log(process.env.NODE_ENV);
  return next(new ErrorHandler("Test error", 500));
  //   res.json({ msg: "hello, world" });
});

app.use(ErrorHandlingMiddleware);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
