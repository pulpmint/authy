import type { CookieOptions, Request, Response } from "express";
import type { JWTPayload, JWTVerifyResult } from "jose";
import type { JwtTokenType } from "@/constants/jwt";

import { jwtVerify, SignJWT } from "jose";

import { JWT_CONFIG, JWT_TOKENS } from "@/constants/jwt";

import { getCookie } from "@/utils";

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
  iat: number,
  exp: number
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

      const token = await signToken(payload, type, iat, exp.getTime());

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

export const verifyToken = (
  type: JwtTokenType,
  token?: string
): Promise<JWTVerifyResult<JWTPayload> | null> => {
  return new Promise(async resolve => {
    try {
      if (!token) {
        resolve(null);
      } else {
        const { SECRET } = JWT_CONFIG[type];

        const decoded = await jwtVerify(
          token,
          new TextEncoder().encode(SECRET)
        );

        resolve(decoded);
      }
    } catch (error) {
      resolve(null);
    }
  });
};

export const verifyAccessToken = (token?: string) =>
  verifyToken(JWT_TOKENS.ACCESS, token);

export const verifyRefreshToken = (token?: string) =>
  verifyToken(JWT_TOKENS.REFRESH, token);

export const verifyTokens = (
  req: Request
): Promise<(JWTVerifyResult<JWTPayload> | null)[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const accessToken = getCookie(JWT_CONFIG.ACCESS.COOKIE, req);
      const refreshtoken = getCookie(JWT_CONFIG.REFRESH.COOKIE, req);

      const [access, refresh] = await Promise.all([
        verifyAccessToken(accessToken),
        verifyRefreshToken(refreshtoken)
      ]);

      resolve([access, refresh]);
    } catch (error) {
      reject(error);
    }
  });
};

export const clearToken = (res: Response, type: JwtTokenType) => {
  const { COOKIE } = JWT_CONFIG[type];

  res.clearCookie(COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
};

export const clearAccessToken = (res: Response) =>
  clearToken(res, JWT_TOKENS.ACCESS);

export const clearRefreshToken = (res: Response) =>
  clearToken(res, JWT_TOKENS.REFRESH);

export const clearTokens = (res: Response) => {
  clearAccessToken(res);
  clearRefreshToken(res);
};
