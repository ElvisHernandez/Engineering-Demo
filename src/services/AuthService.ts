import axios from "axios";
import fs from "fs";
import path from "path";

export class AuthService {
  private api = axios.create({
    baseURL: "http://localhost:3000/api/v0.1",
    timeout: 1000,
  });

  constructor() {}

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
    const userEmailPath = path.resolve(
      __dirname,
      "../../private/user-email.txt",
    );
    const pathExists = fs.existsSync(userEmailPath);

    if (pathExists) {
      const email = fs.readFileSync(userEmailPath);

      return email.toString();
    }
  }

  logout() {
    const userEmailPath = path.resolve(
      __dirname,
      "../../private/user-email.txt",
    );
    const userTokenPath = path.resolve(
      __dirname,
      "../../private/cli-auth-token.txt",
    );

    if (fs.existsSync(userEmailPath)) {
      fs.rmSync(userEmailPath);
    }

    if (fs.existsSync(userTokenPath)) {
      fs.rmSync(userTokenPath);
    }
  }
}
