import type { CookieOptions, Request, Response } from "express";
import type { JWTPayload, JWTVerifyResult } from "jose";
import type { JwtTokenType } from "@/constants/jwt";

import { jwtVerify, SignJWT } from "jose";

import { JWT_CONFIG, JWT_TOKENS } from "@/constants/jwt";

import Redis from "@/lib/redis";

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

export const setTokenPayload = (
  res: Response,
  type: JwtTokenType,
  payload: JWTPayload
) => {
  res.locals.payload = {
    ...res.locals.payload,
    [type.toLocaleLowerCase()]: payload
  };
};

export const setToken = (
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

      setTokenPayload(res, type, { ...payload, iat, exp: exp.getTime() });

      resolve("Tokens added to the response");
    } catch (error) {
      reject(error);
    }
  });
};

export const setAccessToken = (res: Response, payload: any) =>
  setToken(res, payload, JWT_TOKENS.ACCESS);

export const setRefreshToken = (res: Response, payload: any) =>
  setToken(res, payload, JWT_TOKENS.REFRESH);

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
  res: Response,
  type: JwtTokenType,
  token?: string
): Promise<JWTVerifyResult<JWTPayload> | null> => {
  return new Promise(async resolve => {
    try {
      if (!token) {
        resolve(null);
      } else {
        const isBlacklisted = await Redis.get(token);

        if (isBlacklisted) {
          clearToken(res, type);
          resolve(null);
          return;
        }

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

export const verifyAccessToken = (res: Response, token?: string) =>
  verifyToken(res, JWT_TOKENS.ACCESS, token);

export const verifyRefreshToken = (res: Response, token?: string) =>
  verifyToken(res, JWT_TOKENS.REFRESH, token);

export const verifyTokens = (
  req: Request,
  res: Response
): Promise<(JWTVerifyResult<JWTPayload> | null)[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const accessToken = req.cookies[JWT_CONFIG.ACCESS.COOKIE];
      const refreshtoken = req.cookies[JWT_CONFIG.REFRESH.COOKIE];

      const [access, refresh] = await Promise.all([
        verifyAccessToken(res, accessToken),
        verifyRefreshToken(res, refreshtoken)
      ]);

      setTokenPayload(res, JWT_TOKENS.ACCESS, access?.payload || {});
      setTokenPayload(res, JWT_TOKENS.REFRESH, refresh?.payload || {});

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

export const blacklistToken = (
  res: Response,
  type: JwtTokenType,
  token?: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      let exp: number | undefined;

      const { [type.toLocaleLowerCase()]: decoded } = res.locals.payload || {};

      exp = (decoded as JWTPayload)?.exp;

      if (!exp && token) {
        const decoded = await verifyToken(res, type, token);
        exp = decoded?.payload?.exp;
      }

      if (!token || !exp) {
        clearToken(res, type);

        resolve("Tokens cleared");
        return;
      }

      await Redis.set(token, type, "PXAT", exp);

      clearToken(res, type);

      resolve("Tokens blacklisted");
    } catch (error) {
      reject(error);
    }
  });
};

export const blacklistAccessToken = (req: Request, res: Response) =>
  blacklistToken(res, JWT_TOKENS.ACCESS, req.cookies[JWT_CONFIG.ACCESS.COOKIE]);

export const blacklistRefreshToken = (req: Request, res: Response) =>
  blacklistToken(
    res,
    JWT_TOKENS.REFRESH,
    req.cookies[JWT_CONFIG.REFRESH.COOKIE]
  );

export const blacklistTokens = (
  req: Request,
  res: Response
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      await Promise.all([
        blacklistAccessToken(req, res),
        blacklistRefreshToken(req, res)
      ]);

      resolve("Tokens blacklisted");
    } catch (error) {
      reject(error);
    }
  });
};
