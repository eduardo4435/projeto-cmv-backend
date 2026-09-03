import express from "express";

import {
    criarFicha,
    listarFichas,
    deletarFicha,
    buscarFichaPorProduto,
} from "../controllers/fichaTecnica.controller.js";

import authMiddleware from "#shared/middlewares/auth.middleware.js";

import asyncHandler from "#shared/middlewares/async-handler.js";

import authorize from "#shared/middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("admin"), asyncHandler(criarFicha));

router.get("/", authMiddleware, asyncHandler(listarFichas));

router.get("/produto/:id", authMiddleware, asyncHandler(buscarFichaPorProduto));

router.delete("/:id", authMiddleware, authorize("admin"), asyncHandler(deletarFicha));

export default router;
