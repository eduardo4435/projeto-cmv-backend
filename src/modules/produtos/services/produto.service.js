import Produto from "../models/produto.model.js";

import FichaTecnica from "../../fichaTecnica/models/fichaTecnica.model.js";

import AppError from "#shared/errors/AppError.js";

import validarObjectId from "#shared/validators/validar-object-id.js";

import { validarCriacaoProduto } from "../validators/produto.validator.js";

import { validarCriacaoFicha } from "../../fichaTecnica/validators/fichaTecnica.validator.js";

import { calcularCusto } from "#domain/custos/calcular-custos.js";

import { converterQuantidadeInsumoParaBase } from "#domain/estoque/unidades.js";

import { buscarInsumosEmpresa } from "#domain/estoque/buscar-insumos-empresa.js";

import { criarMetadadosPaginacao, escaparRegex } from "#shared/utils/paginacao.js";

import { executarTransacao } from "#shared/database/executar-transacao.js";

// criar produto
export const criarProdutoService = async ({ nome, preco, estoque, categoria }, empresaId) => {
    validarCriacaoProduto({
        nome,
        preco,
        categoria,
    });

    const produto = await Produto.create({
        nome,
        preco,
        estoque,
        categoria,

        empresaId: empresaId,
    });

    return produto;
};

// listar produtos
export const listarProdutosService = async (empresaId, opcoes = { paginado: false }) => {
    const filtro = { empresaId };

    if (opcoes.search) {
        filtro.nome = {
            $regex: escaparRegex(opcoes.search),
            $options: "i",
        };
    }

    if (opcoes.categoria && opcoes.categoria !== "todas") {
        filtro.categoria = opcoes.categoria;
    }

    let consultaProdutos = Produto.find(filtro).lean();
    let total;

    if (opcoes.paginado) {
        [total, consultaProdutos] = await Promise.all([
            Produto.countDocuments(filtro),
            Produto.find(filtro)
                .sort({ createdAt: -1, _id: -1 })
                .skip(opcoes.skip)
                .limit(opcoes.limit)
                .lean(),
        ]);
    } else {
        consultaProdutos = await consultaProdutos;
    }

    const produtos = consultaProdutos;
    const produtoIds = produtos.map((produto) => produto._id);

    const fichas = await FichaTecnica.find({
        empresaId,
        ...(opcoes.paginado && {
            produto: { $in: produtoIds },
        }),
    })
        .select("produto custoTotal")
        .lean();

    const mapaFichas = {};

    fichas.forEach((f) => {
        mapaFichas[f.produto.toString()] = f;
    });

    const data = produtos.map((prod) => {
        const ficha = mapaFichas[prod._id.toString()];

        const custo = ficha ? ficha.custoTotal : 0;

        return {
            ...prod,
            custo,
        };
    });

    return {
        data,
        ...(opcoes.paginado && {
            pagination: criarMetadadosPaginacao({
                page: opcoes.page,
                limit: opcoes.limit,
                total,
            }),
        }),
    };
};

// buscar produto
export const buscarProdutoService = async (id, empresaId) => {
    validarObjectId(id);

    const produto = await Produto.findOne({
        _id: id,
        empresaId: empresaId,
    });

    if (!produto) {
        throw new AppError("Produto não encontrado", 404);
    }

    return produto;
};

// atualizar produto
export const atualizarProdutoService = async (
    id,
    { nome, categoria, preco, ingredientes },
    empresaId
) => {
    validarObjectId(id);

    validarCriacaoProduto({ nome, categoria, preco });

    validarCriacaoFicha({ nome, categoria, ingredientes });

    const ingredientesConvertidos = [];

    const insumosPorId = await buscarInsumosEmpresa({
        ingredientes,
        empresaId,
    });

    for (const item of ingredientes) {
        const insumo = insumosPorId.get(item.insumo.toString());

        ingredientesConvertidos.push({
            insumo: insumo._id,
            quantidade: converterQuantidadeInsumoParaBase(item.quantidade, insumo),
        });
    }

    const custoTotal = await calcularCusto({
        ingredientes: ingredientesConvertidos,
        empresaId,
    });

    const { produto, ficha } = await executarTransacao(async (sessao) => {
        const produtoAtualizado = await Produto.findOneAndUpdate(
            {
                _id: id,
                empresaId,
            },
            { nome, categoria, preco },
            {
                new: true,
                session: sessao,
            }
        );

        if (!produtoAtualizado) {
            throw new AppError("Produto não encontrado", 404);
        }

        const fichaAtualizada = await FichaTecnica.findOneAndUpdate(
            {
                produto: produtoAtualizado._id,
                empresaId,
            },
            {
                ingredientes: ingredientesConvertidos,
                custoTotal,
            },
            {
                new: true,
                session: sessao,
            }
        );

        if (!fichaAtualizada) {
            throw new AppError("Ficha técnica não encontrada", 404);
        }

        return {
            produto: produtoAtualizado,
            ficha: fichaAtualizada,
        };
    });

    return { produto, ficha, custoTotal };
};

// deletar produto
export const deletarProdutoService = async (id, empresaId) => {
    validarObjectId(id);

    const existe = await FichaTecnica.exists({
        produto: id,
        empresaId: empresaId,
    });

    if (existe) {
        throw new AppError("Produto está sendo usado em uma ficha técnica", 409);
    }

    const produto = await Produto.findOneAndDelete({
        _id: id,
        empresaId: empresaId,
    });

    if (!produto) {
        throw new AppError("Produto não encontrado", 404);
    }

    return true;
};
