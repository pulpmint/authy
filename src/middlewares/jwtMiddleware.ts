import type { NextFunction, Request, Response } from "express";

import createHttpError from "http-errors";

import { JWT_CONFIG, JWT_TOKENS } from "@/constants/jwt";

import { getCookie } from "@/utils";
import { setTokens, verifyToken } from "@/utils/jwt";
import { CUSTOM_ERR_CODES_MAPPING } from "@/constants/errors";

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = getCookie(JWT_CONFIG.ACCESS.COOKIE, req);
    const refreshToken = getCookie(JWT_CONFIG.REFRESH.COOKIE, req);

    const [accessDecoded, refreshDecoded] = await Promise.all([
      verifyToken(JWT_TOKENS.ACCESS, accessToken),
      verifyToken(JWT_TOKENS.REFRESH, refreshToken)
    ]);

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
