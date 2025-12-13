import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX } from "@/constants/regex";

import { isEmpty, matchRegex } from "@/utils";

export type ValidationSchemaFunction = (value: any) => string | undefined;

export const validate = (
  value: any,
  key: string,
  required?: boolean,
  validation?: ValidationSchemaFunction
): string => {
  if (required && isEmpty(value)) {
    return `${key} is required`;
  }

  if (typeof validation === "function") {
    return validation(value) || "";
  }

  return "";
};

export const nameSchema: ValidationSchemaFunction = value => {
  if (!matchRegex(value, NAME_REGEX, true)) {
    return "Name can only contain alphabets and spaces";
  }
};

export const emailSchema: ValidationSchemaFunction = value => {
  if (!matchRegex(value, EMAIL_REGEX, true)) {
    return "Email is not valid";
  }
};

export const passwordSchema: ValidationSchemaFunction = value => {
  if (!matchRegex(value, PASSWORD_REGEX)) {
    return "Password must have at least one lower and uppercase letters, special characters, numbers & must 8 - 32 characters long";
  }
};
