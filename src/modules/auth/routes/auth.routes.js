import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";

import asyncHandler from "#shared/middlewares/async-handler.js";

import { validarRegister, validarLogin } from "../validators/auth.validator.js";
import authMiddleware from "#shared/middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validarRegister, asyncHandler(authController.register));

router.post("/login", validarLogin, asyncHandler(authController.login));

router.get("/me", authMiddleware, authController.me);

export default router;
