import express from "express";

import {
    criarInsumo,
    listarInsumos,
    atualizarInsumo,
    deletarInsumo,
    criarInsumoComFicha,
} from "../controllers/insumo.controller.js";

import authMiddleware from "#shared/middlewares/auth.middleware.js";

import asyncHandler from "#shared/middlewares/async-handler.js";

import authorize from "#shared/middlewares/authorize.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", authorize("admin"), asyncHandler(criarInsumo));

router.post("/com-ficha", authorize("admin"), asyncHandler(criarInsumoComFicha));

router.get("/", asyncHandler(listarInsumos));

router.put("/:id", authorize("admin"), asyncHandler(atualizarInsumo));

router.delete("/:id", authorize("admin"), asyncHandler(deletarInsumo));

export default router;
