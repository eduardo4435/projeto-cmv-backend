import {
    criarProdutoService,
    listarProdutosService,
    buscarProdutoService,
    atualizarProdutoService,
    deletarProdutoService,
} from "../services/produto.service.js";
import { obterOpcoesListagem } from "#shared/utils/paginacao.js";
import { responderSucesso } from "#shared/http/resposta.js";
import { temPermissao } from "#shared/auth/permissoes.js";

// criar
export const criarProduto = async (req, res) => {
    const data = await criarProdutoService(req.body, req.usuario.empresaId);

    return responderSucesso(res, {
        statusCode: 201,
        data,
    });
};

// listar
export const listarProdutos = async (req, res) => {
    const incluirCustos = temPermissao(req.usuario.cargo, "cmv:ler");
    const resultado = await listarProdutosService(
        req.usuario.empresaId,
        obterOpcoesListagem(req.query),
        incluirCustos
    );

    return responderSucesso(res, {
        data: resultado.data,
        pagination: resultado.pagination,
    });
};

// buscar
export const buscarProduto = async (req, res) => {
    const data = await buscarProdutoService(req.params.id, req.usuario.empresaId);

    return responderSucesso(res, {
        data: temPermissao(req.usuario.cargo, "cmv:ler")
            ? data
            : { _id: data._id, nome: data.nome, categoria: data.categoria, preco: data.preco },
    });
};

// atualizar
export const atualizarProduto = async (req, res) => {
    const data = await atualizarProdutoService(req.params.id, req.body, req.usuario.empresaId);

    return responderSucesso(res, {
        data,
    });
};

// deletar
export const deletarProduto = async (req, res) => {
    await deletarProdutoService(req.params.id, req.usuario.empresaId);

    return responderSucesso(res, {
        message: "Produto deletado com sucesso",
    });
};
