import type { NextFunction, Request, Response } from "express";

import createHttpError from "http-errors";

import { CUSTOM_ERR_CODES_MAPPING } from "@/constants/errors";

import { setTokens, verifyTokens } from "@/utils/jwt";

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [accessDecoded, refreshDecoded] = await verifyTokens(req);

    const accessPayload = accessDecoded?.payload;
    const refreshPayload = refreshDecoded?.payload;

    if (!accessPayload && !refreshPayload) {
      next(
        createHttpError(401, {
          message: "Invalid / missing tokens",
          code: CUSTOM_ERR_CODES_MAPPING.JWT_VALIDATIONS
        })
      );
      return;
    }

    if (!accessPayload && refreshPayload) {
      await setTokens(res, refreshPayload);
    }

    const payload = accessPayload || refreshPayload;
    res.locals.payload = { ...payload };

    next();
    return;
  } catch (error) {
    next(error);
    return;
  }
};
