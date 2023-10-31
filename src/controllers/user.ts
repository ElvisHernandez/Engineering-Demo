import { Request, Response } from "express";
import { z } from "zod";

const RegisterUserSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const registerUser = async (
  req: Request,
  res: Response,
  //   next: NextFunction,
) => {
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

  res.status(200).json({
    success: true,
    message: "User registered",
    data: user,
  });
};
