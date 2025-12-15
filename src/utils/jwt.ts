import type { CookieOptions, Response } from "express";
import type { JWTPayload } from "jose";
import type { JwtTokenType } from "@/constants/jwt";

import { SignJWT } from "jose";

import { JWT_CONFIG, JWT_TOKENS } from "@/constants/jwt";

export const createTokenCookieConfig = (exp: Date): CookieOptions => {
  return {
    httpOnly: true,
    secure: true,
    expires: exp,
    sameSite: "strict"
  };
};

export const signToken = (
  payload: JWTPayload,
  type: JwtTokenType,
  iat: number | string | Date,
  exp: number | string | Date
): Promise<string> => {
  const { SECRET } = JWT_CONFIG[type];

  return new SignJWT({ type, ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(SECRET));
};

export const setTokenCookie = (
  res: Response,
  payload: JWTPayload,
  type: JwtTokenType
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { COOKIE, TIME } = JWT_CONFIG[type];

      const iat = Date.now();
      const exp = new Date(iat + TIME);

      const token = await signToken(payload, type, iat, exp);

      res.cookie(COOKIE, token, createTokenCookieConfig(exp));

      resolve("Tokens added to the response");
    } catch (error) {
      reject(error);
    }
  });
};

export const setAccessToken = (res: Response, payload: any) =>
  setTokenCookie(res, payload, JWT_TOKENS.ACCESS);

export const setRefreshToken = (res: Response, payload: any) =>
  setTokenCookie(res, payload, JWT_TOKENS.REFRESH);

export const setTokens = (res: Response, payload: any): Promise<String> => {
  return new Promise(async (resolve, reject) => {
    try {
      await Promise.all([
        setAccessToken(res, payload),
        setRefreshToken(res, payload)
      ]);

      resolve("Tokens added to the response");
    } catch (error) {
      reject(error);
    }
  });
};
