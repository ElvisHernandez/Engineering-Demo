import express from "express";
import { registerUser } from "../controllers/user";
import { handleAsyncError } from "../middlewares/errors";
const router = express.Router();

router.post("/register", handleAsyncError(registerUser));

export default router;
