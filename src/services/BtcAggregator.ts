import axios, { AxiosInstance } from "axios";
import Bottleneck from "bottleneck";
import { z } from "zod";

export const TransactionSchema = z.object({
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

// rate limit api to max of 1 request per second
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000,
});

export class BtcAggregator {
  private api: AxiosInstance;

  constructor(address: string) {
    this.api = axios.create({
      baseURL: `https://blockchain.info/rawaddr/${address}`,
      timeout: 1000,
    });
  }

  async getAddressRecentStats() {
    const { data } = await limiter.schedule(() => this.api.get("?limit=0"));

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

  async getAddressTransctions(limit: string | number, offset: string | number) {
    const { data } = await limiter.schedule(() =>
      this.api.get(`?limit=${limit}&offset=${offset}`),
    );

    const transactions = z.array(TransactionSchema).parse(data.txs);

    return transactions.map((transaction) => ({
      ...transaction,
      fee: transaction.fee / SATOSHI,
      result: transaction.result / SATOSHI,
      balance: transaction.balance / SATOSHI,
    }));
  }
}
