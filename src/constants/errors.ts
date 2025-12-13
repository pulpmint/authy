export type BasicError = {
  status: number;
  message: string;
  code?: string;
  errors?: any;
};

export type ErrorCodesMapping = Record<string, BasicError>;

export const ERR_CODES_MAPPING: ErrorCodesMapping = {
  P2002: {
    status: 400,
    message: "User already exists"
  }
};

export const CUSTOM_ERR_CODES_MAPPING = {
  VALIDATIONS: "VALIDATIONS"
};
