import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { insertBtcAddress } from "../controllers/btcAddress";
import { handleAsyncError } from "../middlewares/errors";

const router = express.Router();

router
  .route("/btc/address")
  .post(isAuthenticated, handleAsyncError(insertBtcAddress));

export default router;
