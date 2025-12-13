import type { NextFunction, Request, Response } from "express";

import Prisma from "@/lib/prisma";

export const userDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await Prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        message: "User not found"
      });
      return;
    }

    const { password, ...rest } = user;

    res.status(200).json(rest);
    return;
  } catch (error) {
    next(error);
    return;
  }
};
