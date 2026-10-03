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

router.post("/", authorize("cmv:gerir"), asyncHandler(criarInsumo));

router.post("/com-ficha", authorize("cmv:gerir"), asyncHandler(criarInsumoComFicha));

router.get("/", authorize("cmv:ler"), asyncHandler(listarInsumos));

router.put("/:id", authorize("cmv:gerir"), asyncHandler(atualizarInsumo));

router.delete("/:id", authorize("cmv:gerir"), asyncHandler(deletarInsumo));

export default router;
