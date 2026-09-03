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

router.post("/", authMiddleware, authorize("admin"), asyncHandler(criarProduto));

router.get("/", authMiddleware, asyncHandler(listarProdutos));

router.get("/:id", authMiddleware, asyncHandler(buscarProduto));

router.put("/:id", authMiddleware, authorize("admin"), asyncHandler(atualizarProduto));

router.delete("/:id", authMiddleware, authorize("admin"), asyncHandler(deletarProduto));

export default router;
