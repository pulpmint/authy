import type { NextFunction, Request, Response } from "express";

import { Router } from "express";

import payloadValidation from "@/middlewares/payloadMiddleware";

import { signIn, signUp } from "@/services/authService";

import { SIGN_IN_ROUTE, SIGN_UP_ROUTE } from "@/constants/routes";

import {
  SIGN_IN_PAYLOAD_VALIDATION,
  SIGN_UP_PAYLOAD_VALIDATION
} from "@/validations/authValidations";

const router = Router();

router.post(
  SIGN_UP_ROUTE,
  (req: Request, res: Response, next: NextFunction) =>
    payloadValidation(req, res, next, SIGN_UP_PAYLOAD_VALIDATION),
  signUp
);

router.post(
  SIGN_IN_ROUTE,
  (req: Request, res: Response, next: NextFunction) =>
    payloadValidation(req, res, next, SIGN_IN_PAYLOAD_VALIDATION),
  signIn
);

export default router;
