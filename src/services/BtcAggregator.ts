import axios, { AxiosInstance } from "axios";
import { z } from "zod";

const TransactionSchema = z.object({
  hash: z.string(),
  fee: z.number(),
  time: z.number(),
  result: z.number(),
  balance: z.number(),
});

const AddressStatsSchema = z.object({
  n_tx: z.number(),
  total_received: z.number(),
  total_sent: z.number(),
  final_balance: z.number(),
  txs: z.array(TransactionSchema),
});

// divide blockchain api quantities by this to receive quantities in BTC
const SATOSHI = 100_000_000;

export class BtcAggregator {
  private api: AxiosInstance;

  constructor(address: string) {
    this.api = axios.create({
      baseURL: `https://blockchain.info/rawaddr/${address}`,
      timeout: 1000,
    });
  }

  async getAddressRecentStats() {
    console.log("In the  getAddressRecentStats function");

    const { data } = await this.api.get("?limit=5");

    const { final_balance, n_tx, total_received, total_sent, txs } =
      AddressStatsSchema.parse(data);

    return {
      balance: final_balance / SATOSHI,
      transactionAmount: n_tx,
      received: total_received / SATOSHI,
      sent: total_sent / SATOSHI,
      transactions: txs,
    };
  }
}
