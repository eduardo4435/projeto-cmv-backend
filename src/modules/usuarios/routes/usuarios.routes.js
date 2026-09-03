import { Router } from "express";

import {
    listarUsuariosController,
    criarUsuarioController,
    atualizarUsuarioController,
    deletarUsuarioController,
} from "../controllers/usuario.controller.js";

import { validarCriarUsuario, validarAtualizarUsuario } from "../validators/usuario.validator.js";

import authMiddleware from "#shared/middlewares/auth.middleware.js";

import authorize from "#shared/middlewares/authorize.middleware.js";

import asyncHandler from "#shared/middlewares/async-handler.js";

const router = Router();

router.get("/", authMiddleware, authorize("admin"), asyncHandler(listarUsuariosController));

router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    validarCriarUsuario,
    asyncHandler(criarUsuarioController)
);

router.put(
    "/:id",
    authMiddleware,
    authorize("admin"),
    validarAtualizarUsuario,
    asyncHandler(atualizarUsuarioController)
);

router.delete("/:id", authMiddleware, authorize("admin"), asyncHandler(deletarUsuarioController));

export default router;
