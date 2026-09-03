import {
    criarFichaService,
    listarFichasService,
    buscarFichaPorProdutoService,
    deletarFichaService,
} from "../services/fichaTecnica.service.js";
import { obterOpcoesListagem } from "#shared/utils/paginacao.js";
import { responderSucesso } from "#shared/http/resposta.js";

// criar
export const criarFicha = async (req, res) => {
    const data = await criarFichaService(req.body, req.usuario.empresaId);

    return responderSucesso(res, {
        statusCode: 201,
        data,
    });
};

// listar
export const listarFichas = async (req, res) => {
    const resultado = await listarFichasService(
        req.usuario.empresaId,
        obterOpcoesListagem(req.query)
    );

    return responderSucesso(res, {
        data: resultado.data,
        pagination: resultado.pagination,
    });
};

// buscar
export const buscarFichaPorProduto = async (req, res) => {
    const data = await buscarFichaPorProdutoService(req.params.id, req.usuario.empresaId);

    return responderSucesso(res, {
        data,
    });
};

// deletar
export const deletarFicha = async (req, res) => {
    await deletarFichaService(req.params.id, req.usuario.empresaId);

    return responderSucesso(res, {
        message: "Ficha e produto deletados",
    });
};
