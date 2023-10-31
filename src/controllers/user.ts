import { Request, Response } from "express";
import { z } from "zod";
import { ErrorHandler } from "../services/ErrorHandler";
import { getEnvVar } from "../utils/getEnvVar";

const RegisterUserSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name } = RegisterUserSchema.parse(req.body);

  const user = await req.prisma.user.create({
    data: {
      email,
      name,
      resetPasswordExpiry: "",
      resetPasswordToken: "",
      password: await req.db.encrypt(password),
    },
    select: {
      email: true,
      name: true,
      createdAt: true,
    },
  });

  const userToken = req.db.getJwtToken(user.email);
  const cookieOptions = getCookieOptions();

  res.status(200).cookie("token", userToken, cookieOptions).json({
    success: true,
    message: "User registered",
    data: user,
  });
};

const LoginUserSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
});

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = LoginUserSchema.parse(req.body);

  const user = await req.prisma.user.findUnique({ where: { email } });

  const invalidUserMessage = "Invalid email or password";

  if (!user) throw new ErrorHandler(invalidUserMessage, 401);

  const isUser = await req.db.compareToHash(password, user.password);

  if (!isUser) throw new ErrorHandler(invalidUserMessage, 401);

  const userToken = req.db.getJwtToken(user.email);
  const cookieOptions = getCookieOptions();

  res.status(200).cookie("token", userToken, cookieOptions).json({
    success: true,
    message: "User logged in",
    data: {},
  });
};

export const getCookieOptions = () => ({
  httpOnly: true,
  expires: new Date(
    Date.now() +
      parseInt(getEnvVar("COOKIE_EXPIRY_TIME")) * 24 * 60 * 60 * 1000,
  ),
});
