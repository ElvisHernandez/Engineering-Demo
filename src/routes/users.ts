import express from "express";
import { loginUser, registerUser } from "../controllers/user";
import { handleAsyncError } from "../middlewares/errors";
const router = express.Router();

router.route("/register").post(handleAsyncError(registerUser));
router.route("/login").post(handleAsyncError(loginUser));

export default router;
