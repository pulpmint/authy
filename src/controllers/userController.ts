import { Router } from "express";

import { userDetails } from "@/services/userService";

import { verifyJwt } from "@/middlewares/jwtMiddleware";

import { USER_DETAILS_ROUTE } from "@/constants/routes";

const router = Router();

router.get(USER_DETAILS_ROUTE, verifyJwt, userDetails);

export default router;
