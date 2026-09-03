import FichaTecnica from "../models/fichaTecnica.model.js";

import Produto from "../../produtos/models/produto.model.js";

import { calcularCusto } from "#domain/custos/calcular-custos.js";

import { calcularMetricas } from "#domain/custos/calcular-metricas.js";

import { round } from "#shared/utils/round-number.js";

import AppError from "#shared/errors/AppError.js";

import validarObjectId from "#shared/validators/validar-object-id.js";

import { buscarInsumosEmpresa } from "#domain/estoque/buscar-insumos-empresa.js";

import { criarMetadadosPaginacao, escaparRegex } from "#shared/utils/paginacao.js";

import { validarCriacaoFicha } from "../validators/fichaTecnica.validator.js";

import {
    converterQuantidadeInsumoParaBase,
    converterQuantidadeInsumoParaExibicao,
    obterUnidadeUsoInsumo,
} from "#domain/estoque/unidades.js";

import { executarTransacao } from "#shared/database/executar-transacao.js";

// criar
export const criarFichaService = async ({ nome, categoria, ingredientes, preco }, empresaId) => {
    validarCriacaoFicha({
        nome,
        categoria,
        ingredientes,
    });

    const insumosPorId = await buscarInsumosEmpresa({
        ingredientes,
        empresaId,
    });

    for (const item of ingredientes) {
        const insumo = insumosPorId.get(item.insumo.toString());

        item.quantidade = converterQuantidadeInsumoParaBase(item.quantidade, insumo);
    }

    const custoTotal = await calcularCusto({
        ingredientes,
        empresaId,
    });

    const { produto, ficha } = await executarTransacao(async (sessao) => {
        const [produtoCriado] = await Produto.create(
            [
                {
                    nome,
                    categoria,
                    preco: preco || 0,
                    empresaId,
                },
            ],
            { session: sessao }
        );

        const [fichaCriada] = await FichaTecnica.create(
            [
                {
                    produto: produtoCriado._id,
                    ingredientes,
                    custoTotal,
                    empresaId,
                },
            ],
            { session: sessao }
        );

        return {
            produto: produtoCriado,
            ficha: fichaCriada,
        };
    });

    const metricas = calcularMetricas(preco || 0, custoTotal);

    return {
        produto,
        ficha,
        custoTotal,
        ...metricas,
    };
};

// listar
export const listarFichasService = async (empresaId, opcoes = { paginado: false }) => {
    const filtro = { empresaId };

    if (opcoes.search || (opcoes.categoria && opcoes.categoria !== "todas")) {
        const filtroProduto = { empresaId };

        if (opcoes.search) {
            filtroProduto.nome = {
                $regex: escaparRegex(opcoes.search),
                $options: "i",
            };
        }

        if (opcoes.categoria && opcoes.categoria !== "todas") {
            filtroProduto.categoria = opcoes.categoria;
        }

        const produtos = await Produto.find(filtroProduto).select("_id").lean();

        filtro.produto = {
            $in: produtos.map((produto) => produto._id),
        };
    }

    let totalPromise = Promise.resolve(undefined);
    let consulta = FichaTecnica.find(filtro);

    if (opcoes.paginado) {
        totalPromise = FichaTecnica.countDocuments(filtro);
        consulta = consulta.sort({ createdAt: -1, _id: -1 }).skip(opcoes.skip).limit(opcoes.limit);
    }

    const [total, fichas] = await Promise.all([
        totalPromise,
        consulta.populate("produto").populate("ingredientes.insumo").lean(),
    ]);

    const data = fichas.map((f) => {
        const preco = f.produto?.preco || 0;

        const custo = f.custoTotal;

        const metricas = calcularMetricas(preco, custo);

        return {
            _id: f._id,

            produtoId: f.produto?._id,

            produto: f.produto?.nome,

            categoria: f.produto?.categoria,

            precoVenda: round(preco),

            custoTotal: round(custo),

            ...metricas,

            ingredientes: f.ingredientes.map((i) => {
                const insumo = i.insumo
                    ? {
                          _id: i.insumo?._id,
                          nome: i.insumo?.nome,
                          unidade: i.insumo?.unidade || "",
                          valorUnitario: i.insumo?.valorUnitario || 0,
                          pesoUnitario: i.insumo?.pesoUnitario || null,
                          unidadePesoUnitario: i.insumo?.unidadePesoUnitario || null,
                      }
                    : {
                          _id: null,
                          nome: "Ingrediente removido",
                          unidade: "",
                          valorUnitario: 0,
                      };

                return {
                    insumo,
                    quantidade: i.insumo
                        ? converterQuantidadeInsumoParaExibicao(i.quantidade, i.insumo)
                        : i.quantidade,
                };
            }),
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

// buscar
export const buscarFichaPorProdutoService = async (produtoId, empresaId) => {
    validarObjectId(produtoId);

    const ficha = await FichaTecnica.findOne({
        produto: produtoId,

        empresaId: empresaId,
    })
        .populate("produto")
        .populate("ingredientes.insumo");

    if (!ficha) {
        throw new AppError("Ficha não encontrada", 404);
    }

    const preco = ficha.produto?.preco || 0;

    const custo = ficha.custoTotal;

    const metricas = calcularMetricas(preco, custo);

    return {
        _id: ficha._id,

        produto: ficha.produto,

        custoTotal: round(custo),

        ...metricas,

        ingredientes: ficha.ingredientes.map((i) => {
            const quantidadeExibicao = converterQuantidadeInsumoParaExibicao(
                i.quantidade,
                i.insumo
            );

            return {
                insumo: i.insumo,

                quantidade: quantidadeExibicao,

                unidade: obterUnidadeUsoInsumo(i.insumo),

                valorUnitario: i.insumo?.valorUnitario || 0,

                total: round(i.quantidade * (i.insumo?.valorUnitario || 0)),
            };
        }),
    };
};

// deletar
export const deletarFichaService = async (id, empresaId) => {
    validarObjectId(id);

    const ficha = await FichaTecnica.findOne({
        _id: id,

        empresaId: empresaId,
    });

    if (!ficha) {
        throw new AppError("Ficha não encontrada", 404);
    }

    await executarTransacao(async (sessao) => {
        await Produto.findOneAndDelete(
            {
                _id: ficha.produto,
                empresaId,
            },
            { session: sessao }
        );

        await FichaTecnica.deleteOne(
            {
                _id: ficha._id,
                empresaId,
            },
            { session: sessao }
        );
    });

    return true;
};
