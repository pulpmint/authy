import type { NextFunction, Request, Response } from "express";
import type {
  SignInPayload,
  SignUpPayload
} from "@/validations/authValidations";

import { hashPassword, verifyPassword } from "@/utils";
import { setTokens } from "@/utils/jwt";

import Prisma from "@/lib/prisma";

export const signUp = async (
  req: Request<any, any, SignUpPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const hash = await hashPassword(password);

    const data = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hash
    };

    const user = await Prisma.user.create({ data });
    const { id } = user;

    const payload = { id, name, email };

    await setTokens(res, payload);

    res.status(201).json({
      message: "User registered successfully",
      data: payload
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const signIn = async (
  req: Request<any, any, SignInPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await Prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({
        message: "User does not exist"
      });
      return;
    }

    const isCorrectPassword = await verifyPassword(
      user.password || "",
      password
    );

    if (!isCorrectPassword) {
      res.status(400).json({
        message: "Incorrect password"
      });
      return;
    }

    const { id, name } = user;
    const payload = { id, name, email };

    await setTokens(res, payload);

    res.status(200).json({
      message: "User signed in successfully",
      data: payload
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};
