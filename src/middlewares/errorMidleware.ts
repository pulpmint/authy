import type { NextFunction, Request, Response } from "express";
import type { BasicError } from "@/constants/errors";

import {
  CUSTOM_ERR_CODES_MAPPING,
  ERR_CODES_MAPPING
} from "@/constants/errors";

const errorHandler = (
  error: BasicError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("ERROR HANDLER", { ...error });

  const { status, code, message, errors } = error;

  switch (code) {
    case CUSTOM_ERR_CODES_MAPPING.PAYLOAD_VALIDATIONS: {
      res.status(400).json({
        message: "Invalid request",
        errors: errors || {}
      });
      return;
    }
    case CUSTOM_ERR_CODES_MAPPING.JWT_VALIDATIONS: {
      res.status(status || 401).json({
        message: message || "Unauthorised"
      });
      return;
    }
    default: {
      const errRes = ERR_CODES_MAPPING[code || "DEFAULT"];

      if (errRes) {
        const { status, message, ...rest } = errRes;
        res.status(status).json({
          message,
          ...rest
        });
        return;
      }
    }
  }
};

export default errorHandler;
