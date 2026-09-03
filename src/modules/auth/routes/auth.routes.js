import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";

import asyncHandler from "#shared/middlewares/async-handler.js";

import { validarRegister, validarLogin } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validarRegister, asyncHandler(authController.register));

router.post("/login", validarLogin, asyncHandler(authController.login));

export default router;
