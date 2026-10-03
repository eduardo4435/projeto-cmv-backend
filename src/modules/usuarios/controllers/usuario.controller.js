import {
    listarUsuarios,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
} from "../services/usuario.service.js";
import { responderSucesso } from "#shared/http/resposta.js";
import { cargosAtribuiveis } from "#shared/auth/permissoes.js";

export const listarCargosController = (req, res) =>
    responderSucesso(res, {
        data: cargosAtribuiveis.filter(
            (cargo) => req.usuario.cargo === "admin" || cargo !== "gerente"
        ),
    });

export const listarUsuariosController = async (req, res) => {
    const usuarios = await listarUsuarios(req.usuario.empresaId);

    return responderSucesso(res, {
        data: usuarios,
    });
};

export const criarUsuarioController = async (req, res) => {
    const usuario = await criarUsuario(req.body, req.usuario.empresaId, req.usuario);

    return responderSucesso(res, {
        statusCode: 201,
        data: usuario,
    });
};

export const atualizarUsuarioController = async (req, res) => {
    const usuario = await atualizarUsuario(
        req.params.id,
        req.body,
        req.usuario.empresaId,
        req.usuario
    );

    return responderSucesso(res, {
        data: usuario,
    });
};

export const deletarUsuarioController = async (req, res) => {
    await deletarUsuario(req.params.id, req.usuario.empresaId, req.usuario);

    return responderSucesso(res, {
        message: "Usuário desativado com sucesso",
    });
};
