import {
    criarInsumoService,
    criarInsumoComFichaService,
    listarInsumosService,
    atualizarInsumoService,
    deletarInsumoService,
} from "../services/insumo.service.js";
import { obterOpcoesListagem } from "#shared/utils/paginacao.js";
import { responderSucesso } from "#shared/http/resposta.js";

// criar
export const criarInsumo = async (req, res) => {
    const data = await criarInsumoService(req.body, req.usuario.empresaId);

    return responderSucesso(res, {
        statusCode: 201,
        data,
    });
};

// criar com ficha
export const criarInsumoComFicha = async (req, res) => {
    const data = await criarInsumoComFichaService(req.body, req.usuario.empresaId);

    return responderSucesso(res, {
        statusCode: 201,
        data,
    });
};

// listar
export const listarInsumos = async (req, res) => {
    const resultado = await listarInsumosService(
        req.usuario.empresaId,
        obterOpcoesListagem(req.query)
    );

    return responderSucesso(res, {
        data: resultado.data,
        pagination: resultado.pagination,
    });
};

// atualizar
export const atualizarInsumo = async (req, res) => {
    const data = await atualizarInsumoService(req.params.id, req.body, req.usuario.empresaId);

    return responderSucesso(res, {
        data,
    });
};

// deletar
export const deletarInsumo = async (req, res) => {
    await deletarInsumoService(req.params.id, req.usuario.empresaId);

    return responderSucesso(res, {
        message: "Deletado com sucesso",
    });
};
