import { hash, argon2id, verify } from "argon2";

export const isEmpty = (value: any): boolean => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && !value.length) ||
    (typeof value == "object" && !Object.keys(value).length)
  );
};

export const matchRegex = (
  value: any,
  regex: RegExp,
  trim?: boolean
): boolean => {
  const str = String(value);
  return trim ? regex.test(str.trim()) : regex.test(str);
};

export const hashPassword = (value: string): Promise<string> => {
  return hash(value, { type: argon2id });
};

export const verifyPassword = (
  actual: string,
  input: string
): Promise<boolean> => {
  return verify(actual, input);
};
