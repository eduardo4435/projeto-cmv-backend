import { criarTransformadoService } from "../services/transformados.service.js";
import { responderSucesso } from "#shared/http/resposta.js";

export const criarTransformado = async (req, res) => {
    const data = await criarTransformadoService(req.body, req.usuario.empresaId);

    return responderSucesso(res, {
        statusCode: 201,
        data,
    });
};
