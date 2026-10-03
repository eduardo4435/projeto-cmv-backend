import { Router } from "express";

import {
    listarUsuariosController,
    criarUsuarioController,
    atualizarUsuarioController,
    deletarUsuarioController,
    listarCargosController,
} from "../controllers/usuario.controller.js";

import { validarCriarUsuario, validarAtualizarUsuario } from "../validators/usuario.validator.js";

import authMiddleware from "#shared/middlewares/auth.middleware.js";

import authorize from "#shared/middlewares/authorize.middleware.js";

import asyncHandler from "#shared/middlewares/async-handler.js";

const router = Router();

router.get("/cargos", authMiddleware, authorize("usuarios:ler"), listarCargosController);

router.get("/", authMiddleware, authorize("usuarios:ler"), asyncHandler(listarUsuariosController));

router.post(
    "/",
    authMiddleware,
    authorize("usuarios:gerir"),
    validarCriarUsuario,
    asyncHandler(criarUsuarioController)
);

router.put(
    "/:id",
    authMiddleware,
    authorize("usuarios:gerir"),
    validarAtualizarUsuario,
    asyncHandler(atualizarUsuarioController)
);

router.delete(
    "/:id",
    authMiddleware,
    authorize("usuarios:gerir"),
    asyncHandler(deletarUsuarioController)
);

export default router;
