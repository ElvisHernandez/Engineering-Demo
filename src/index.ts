import express from "express";
// import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
// const prisma = new PrismaClient();

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
