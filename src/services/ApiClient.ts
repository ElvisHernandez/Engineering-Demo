import axios, { AxiosInstance, AxiosError } from "axios";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { TransactionSchema } from "./BtcAggregator";

const AddressesSchema = z.array(
  z.object({
    id: z.number(),
    address: z.string(),
    received: z.number(),
    sent: z.number(),
    balance: z.number(),
    transactionsAmount: z.number(),
  }),
);

export class ApiClient {
  private api: AxiosInstance;
  private userEmailPath = path.resolve(
    __dirname,
    "../../private/user-email.txt",
  );
  private userTokenPath = path.resolve(
    __dirname,
    "../../private/cli-auth-token.txt",
  );

  constructor() {
    const token = this.getUserToken();
    this.api = axios.create({
      baseURL: "http://localhost:3000/api/v0.1",
      timeout: 1000,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /***************************** Address *****************************/

  async getAllAddresses() {
    const { data } = await this.api.get("/btc/addresses");
    const addresses = AddressesSchema.parse(data.data);
    const btcExchangeRate = await this.getBtcToUsdRate();

    const formattedAddresses = addresses.map((address) => ({
      id: address.id,
      received: this.btcFormatter(address.received),
      sent: this.btcFormatter(address.sent),
      balance: this.btcFormatter(address.balance),
      receivedUSD: this.usdFormatter(address.received * btcExchangeRate),
      sentUSD: this.usdFormatter(address.sent * btcExchangeRate),
      balanceUSD: this.usdFormatter(address.balance * btcExchangeRate),
      transactions: address.transactionsAmount,
      address: address.address,
    }));

    return formattedAddresses;
  }

  async addAddress(btcAddress: string) {
    try {
      const { data } = await this.api.post("/btc/addresses", { btcAddress });

      return data;
    } catch (e) {
      return (e as AxiosError)?.response?.data;
    }
  }

  async removeAddress(btcAddressId: number) {
    try {
      const { data } = await this.api.delete(`/btc/addresses/${btcAddressId}`);

      return data;
    } catch (e) {
      return (e as AxiosError)?.response?.data;
    }
  }

  async getAddressTransactions(
    btcAddressId: string,
    limit: number,
    offset: number,
  ) {
    try {
      const { data } = await this.api.get(
        `/btc/addresses/${btcAddressId}/transactions?limit=${limit}&offset=${offset}`,
      );
      const btcExchangeRate = await this.getBtcToUsdRate();
      const transactions = z.array(TransactionSchema).parse(data.data);

      const formattedTransactions = transactions.map((transaction) => ({
        ...transaction,
        fee: transaction.fee + " BTC",
        result: this.btcFormatter(transaction.result),
        balance: this.btcFormatter(transaction.balance),
        feeUSD: this.usdFormatter(transaction.fee * btcExchangeRate),
        resultUSD: this.usdFormatter(transaction.result * btcExchangeRate),
        balanceUSD: this.usdFormatter(transaction.balance * btcExchangeRate),
        time: new Date(transaction.time * 1000).toLocaleString(),
      }));

      return formattedTransactions;
    } catch (e) {
      return (e as AxiosError)?.response?.data;
    }
  }

  /***************************** Auth *****************************/

  async login(email: string, password: string) {
    const { data } = await this.api.post("/login", {
      email,
      password,
    });

    this.persistAuthInfo(data.token, data.data.email);
    return data;
  }

  async register(email: string, password: string) {
    const { data } = await this.api.post("/register", {
      email,
      password,
    });

    this.persistAuthInfo(data.token, data.data.email);
    return data;
  }

  persistAuthInfo(token: string, userEmail: string) {
    fs.writeFileSync(
      path.resolve(__dirname, "../../private/cli-auth-token.txt"),
      token,
    );
    fs.writeFileSync(
      path.resolve(__dirname, "../../private/user-email.txt"),
      userEmail,
    );
  }

  getUserEmail() {
    if (fs.existsSync(this.userEmailPath)) {
      const email = fs.readFileSync(this.userEmailPath);

      return email.toString();
    }
  }

  getUserToken() {
    if (fs.existsSync(this.userTokenPath)) {
      const token = fs.readFileSync(this.userTokenPath);
      return token.toString();
    }
  }

  logout() {
    if (fs.existsSync(this.userEmailPath)) {
      fs.rmSync(this.userEmailPath);
    }

    if (fs.existsSync(this.userTokenPath)) {
      fs.rmSync(this.userTokenPath);
    }
  }

  /***************************** Utils *****************************/

  async getBtcToUsdRate() {
    const { data: exchangeRates } = await axios.get(
      "https://blockchain.info/ticker",
    );
    const btcExchangeRate = exchangeRates.USD.last;

    return btcExchangeRate;
  }

  btcFormatter(btc: number) {
    const formatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    });

    return formatter.format(btc) + " BTC";
  }

  usdFormatter(usd: number) {
    const usdFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    return usdFormatter.format(usd);
  }
}
