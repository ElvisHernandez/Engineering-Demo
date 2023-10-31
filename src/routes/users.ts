import express from "express";
import { loginUser, registerUser } from "../controllers/user";
import { handleAsyncError } from "../middlewares/errors";
const router = express.Router();

router.post("/register", handleAsyncError(registerUser));
router.post("/login", handleAsyncError(loginUser));

export default router;
