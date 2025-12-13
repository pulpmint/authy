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

  const { code, message, errors } = error;

  switch (code) {
    case CUSTOM_ERR_CODES_MAPPING.VALIDATIONS: {
      res.status(400).json({ message, errors });
      return;
    }
    default: {
      const errRes = code ? ERR_CODES_MAPPING[code] : undefined;

      if (errRes) {
        const { status, ...rest } = errRes;
        res.status(status).json(rest);
        return;
      }
    }
  }

  res.status(500).json({
    message: "Something went wrong"
  });
  return;
};

export default errorHandler;
