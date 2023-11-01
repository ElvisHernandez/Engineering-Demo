import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getEnvVar } from "../utils/getEnvVar";

// singleton db class (available through req object)
export class Db {
  private static db: Db;
  private constructor(private prisma: PrismaClient) {}

  getJwtToken(userEmail: string) {
    const jwtSecret = getEnvVar("JWT_SECRET");
    const jwtExpiry = getEnvVar("JWT_EXPIRY");

    return jwt.sign({ email: userEmail }, jwtSecret, {
      expiresIn: jwtExpiry,
    });
  }

  async encrypt(str: string) {
    return await bcrypt.hash(str, 10);
  }

  async compareToHash(originalStr: string, hash: string) {
    return await bcrypt.compare(originalStr, hash);
  }

  static getInstance(prisma: PrismaClient) {
    if (!this.db) {
      this.db = new Db(prisma);
    }

    return this.db;
  }
}
