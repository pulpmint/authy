export type JwtTokenType = "ACCESS" | "REFRESH";

export type JwtConfig = {
  COOKIE: string;
  TIME: number;
  SECRET: string;
};

export const JWT_TOKENS: Record<JwtTokenType, JwtTokenType> = {
  ACCESS: "ACCESS",
  REFRESH: "REFRESH"
};

export const JWT_CONFIG: Record<JwtTokenType, JwtConfig> = {
  ACCESS: {
    COOKIE: "access",
    TIME: 1 * 60 * 60 * 1000,
    SECRET: process.env.JWT_SECRET_ACCESS as string
  },
  REFRESH: {
    COOKIE: "refresh",
    TIME: 30 * 24 * 60 * 60 * 1000,
    SECRET: process.env.JWT_SECRET_REFRESH as string
  }
};
