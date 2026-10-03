import express from "express";

import {
    criarProduto,
    listarProdutos,
    buscarProduto,
    atualizarProduto,
    deletarProduto,
} from "../controllers/produto.controller.js";

import authMiddleware from "#shared/middlewares/auth.middleware.js";

import asyncHandler from "#shared/middlewares/async-handler.js";

import authorize from "#shared/middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("catalogo:gerir"), asyncHandler(criarProduto));

router.get("/", authMiddleware, authorize("catalogo:ler"), asyncHandler(listarProdutos));

router.get("/:id", authMiddleware, authorize("catalogo:ler"), asyncHandler(buscarProduto));

router.put("/:id", authMiddleware, authorize("catalogo:gerir"), asyncHandler(atualizarProduto));

router.delete("/:id", authMiddleware, authorize("catalogo:gerir"), asyncHandler(deletarProduto));

export default router;
