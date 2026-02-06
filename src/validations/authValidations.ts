import {
  emailSchema,
  nameSchema,
  passwordSchema,
  validate
} from "@/utils/validations";

export const SIGN_UP_PAYLOAD_VALIDATION = {
  name: (value: string) => validate(value, "Name", true, nameSchema),
  email: (value: string) => validate(value, "Email", true, emailSchema),
  password: (value: string) => validate(value, "Password", true, passwordSchema)
};

export const SIGN_IN_PAYLOAD_VALIDATION = {
  email: (value: string) => validate(value, "Email", true, emailSchema),
  password: (value: string) => validate(value, "Password", true)
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};
