import type { NextFunction, Request, Response } from "express";
import type { ValidationSchemaFunction } from "@/utils/validations";

import createHttpError from "http-errors";

import { CUSTOM_ERR_CODES_MAPPING } from "@/constants/errors";

export type PayloadValidationObject = Record<string, ValidationSchemaFunction>;

const payloadValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
  validations: PayloadValidationObject
) => {
  let errors: any = {};

  Object.entries(validations).forEach(([key, fn]) => {
    const value = req.body[key];
    const error = fn(value);
    if (error) {
      errors[key] = error;
    }
  });

  if (Object.keys(errors).length) {
    next(
      createHttpError(400, {
        errors,
        code: CUSTOM_ERR_CODES_MAPPING.PAYLOAD_VALIDATIONS
      })
    );
    return;
  }

  next();
  return;
};

export default payloadValidation;
