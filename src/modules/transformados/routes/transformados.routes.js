import express from "express";

import { criarTransformado } from "../controllers/transformados.controller.js";

import authMiddleware from "#shared/middlewares/auth.middleware.js";

import asyncHandler from "#shared/middlewares/async-handler.js";
import authorize from "#shared/middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("admin"), asyncHandler(criarTransformado));

export default router;
