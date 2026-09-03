import * as authService from "../services/auth.service.js";
import { responderSucesso } from "#shared/http/resposta.js";

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
