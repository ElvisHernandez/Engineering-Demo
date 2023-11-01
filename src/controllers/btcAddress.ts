import { Request, Response } from "express";
import { z } from "zod";
import { address as btcValidator } from "bitcoinjs-lib";
import { BtcAggregator } from "../services/BtcAggregator";

const InsertBtcAddressSchema = z.object({
  btcAddress: z.string().min(1),
});

export const insertBtcAddress = async (req: Request, res: Response) => {
  const { btcAddress } = InsertBtcAddressSchema.parse(req.body);

  // validate btc address
  btcValidator.toOutputScript(btcAddress);

  const aggregator = new BtcAggregator(btcAddress);
  const stats = await aggregator.getAddressRecentStats();
  console.log("stats", stats.balance);

  const address = await req.prisma.address.create({
    data: {
      sent: stats.sent,
      address: btcAddress,
      userId: req.user!.id,
      balance: stats.balance,
      received: stats.received,
      transactionsAmount: stats.transactionAmount,
    },
  });

  res.status(200).json({
    success: true,
    data: address,
  });
};
