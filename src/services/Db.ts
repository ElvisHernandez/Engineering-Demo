import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// singleton db class (available through req object)
export class Db {
  private static db: Db;
  private constructor(private prisma: PrismaClient) {}

  async encrypt(str: string) {
    return await bcrypt.hash(str, 10);
  }

  static getInstance(prisma: PrismaClient) {
    if (!this.db) {
      this.db = new Db(prisma);
    }

    return this.db;
  }
}
