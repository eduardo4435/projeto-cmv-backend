import * as authService from "../services/auth.service.js";
import { responderSucesso } from "#shared/http/resposta.js";
import { permissoesDoCargo } from "#shared/auth/permissoes.js";

export const register = async (req, res) => {
    const usuario = await authService.register(req.body);

    return responderSucesso(res, {
        statusCode: 201,
        data: usuario,
    });
};

export const login = async (req, res) => {
    const resultado = await authService.login(req.body);

    return responderSucesso(res, {
        data: resultado,
    });
};

export const me = (req, res) =>
    responderSucesso(res, {
        data: {
            id: req.usuario.id,
            nome: req.usuario.nome,
            email: req.usuario.email,
            cargo: req.usuario.cargo,
            permissoes: permissoesDoCargo(req.usuario.cargo),
            empresaId: req.usuario.empresaId,
        },
    });
