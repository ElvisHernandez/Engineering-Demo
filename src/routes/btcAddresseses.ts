import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import {
  addBtcAddress,
  getAllBtcAddresses,
  getBtcAddressTransactions,
  removeBtcAddress,
} from "../controllers/btcAddress";
import { handleAsyncError } from "../middlewares/errors";

const router = express.Router();

// Get all BTC addresses
router
  .route("/btc/addresses")
  .get(isAuthenticated, handleAsyncError(getAllBtcAddresses));

// Add a new BTC address
router
  .route("/btc/addresses")
  .post(isAuthenticated, handleAsyncError(addBtcAddress));

// Remove a specific BTC address
router
  .route("/btc/addresses/:addressId")
  .delete(isAuthenticated, handleAsyncError(removeBtcAddress));

// Get transactions of a specific BTC address
router
  .route("/btc/addresses/:addressId/transactions")
  .get(isAuthenticated, handleAsyncError(getBtcAddressTransactions));

export default router;
