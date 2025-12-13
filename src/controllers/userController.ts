import { Router } from "express";

import { userDetails } from "@/services/userService";

import { USER_DETAILS_ROUTE } from "@/constants/routes";

const router = Router();

router.get(USER_DETAILS_ROUTE, userDetails);

export default router;
