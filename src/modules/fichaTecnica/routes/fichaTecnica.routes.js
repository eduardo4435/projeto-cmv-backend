import express from "express";

import {
    criarFicha,
    listarFichas,
    deletarFicha,
    buscarFichaPorProduto,
    consultarFichas,
    buscarFichaConsultaPorProduto,
} from "../controllers/fichaTecnica.controller.js";

import authMiddleware from "#shared/middlewares/auth.middleware.js";

import asyncHandler from "#shared/middlewares/async-handler.js";

import authorize from "#shared/middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("cmv:gerir"), asyncHandler(criarFicha));

router.get("/", authMiddleware, authorize("cmv:ler"), asyncHandler(listarFichas));

router.get("/consulta", authMiddleware, authorize("fichas:consultar"), asyncHandler(consultarFichas));

router.get(
    "/consulta/produto/:id",
    authMiddleware,
    authorize("fichas:consultar"),
    asyncHandler(buscarFichaConsultaPorProduto)
);

router.get(
    "/produto/:id",
    authMiddleware,
    authorize("cmv:ler"),
    asyncHandler(buscarFichaPorProduto)
);

router.delete("/:id", authMiddleware, authorize("cmv:gerir"), asyncHandler(deletarFicha));

export default router;
