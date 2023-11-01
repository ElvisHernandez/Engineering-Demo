import { Request, Response } from "express";
import { z } from "zod";
import { address as btcValidator } from "bitcoinjs-lib";
import { BtcAggregator } from "../services/BtcAggregator";

export const getAllBtcAddresses = async (req: Request, res: Response) => {
  const addresses = await req.prisma.address.findMany({
    where: { userId: req.user!.id },
  });

  res.status(200).json({
    success: true,
    data: addresses,
  });
};

const AddBtcAddressSchema = z.object({
  btcAddress: z.string().min(1),
});

export const addBtcAddress = async (req: Request, res: Response) => {
  const { btcAddress } = AddBtcAddressSchema.parse(req.body);

  // validate btc address
  btcValidator.toOutputScript(btcAddress);

  const aggregator = new BtcAggregator(btcAddress);
  const stats = await aggregator.getAddressRecentStats();
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

const RemoveBtcAddressSchema = z.object({
  addressId: z.coerce.number(),
});

export const removeBtcAddress = async (req: Request, res: Response) => {
  const { addressId } = RemoveBtcAddressSchema.parse(req.params);

  await req.prisma.address.delete({ where: { id: addressId } });

  res.status(200).json({
    success: true,
    message: "Successfully removed address",
  });
};
