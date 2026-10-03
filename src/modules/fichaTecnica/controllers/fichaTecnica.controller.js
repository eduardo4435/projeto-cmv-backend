import {
    criarFichaService,
    listarFichasService,
    buscarFichaPorProdutoService,
    deletarFichaService,
    consultarFichasService,
    buscarFichaConsultaPorProdutoService,
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

// Consulta operacional sem custos, preços ou dados de compra dos insumos.
export const consultarFichas = async (req, res) => {
    const resultado = await consultarFichasService(
        req.usuario.empresaId,
        obterOpcoesListagem(req.query)
    );
    return responderSucesso(res, {
        data: resultado.data,
        pagination: resultado.pagination,
    });
};

export const buscarFichaConsultaPorProduto = async (req, res) => {
    const data = await buscarFichaConsultaPorProdutoService(req.params.id, req.usuario.empresaId);
    return responderSucesso(res, { data });
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
