import Insumo from "../../insumos/models/insumo.model.js";

import { calcularCusto } from "#domain/custos/calcular-custos.js";

import { round } from "#shared/utils/round-number.js";

import AppError from "#shared/errors/AppError.js";

import { validarCriacaoTransformado } from "../validators/transformados.validator.js";

import { mapInsumo } from "#shared/mappers/insumo.mapper.js";
import { obterUnidadeBase, converterQuantidadeInsumoParaBase } from "#domain/estoque/unidades.js";

import { buscarInsumosEmpresa } from "#domain/estoque/buscar-insumos-empresa.js";

// service
export const criarTransformadoService = async (
    { nome, categoria, unidade, rendimento, ingredientes },

    empresaId
) => {
    validarCriacaoTransformado({
        nome,
        categoria,
        unidade,
        rendimento,
        ingredientes,
    });

    // verifica nome duplicado
    const existe = await Insumo.findOne({
        nome,

        empresaId: empresaId,
    });

    if (existe) {
        throw new AppError("Nome já existe", 409);
    }

    // Guarda a unidade escolhida pelo usuário
    const unidadeEntrada = unidade;

    // Converte para a unidade interna do sistema
    rendimento = converterQuantidadeInsumoParaBase(rendimento, { unidade: unidadeEntrada });

    unidade = obterUnidadeBase(unidadeEntrada);

    const insumosPorId = await buscarInsumosEmpresa({
        ingredientes,
        empresaId,
        mensagemNaoEncontrado: "Ingrediente inválido",
    });

    // Cada ingrediente é convertido conforme a própria unidade cadastrada.
    // Isso permite combinar, por exemplo, arroz em kg e água em l.
    ingredientes = ingredientes.map((item) => {
        const insumo = insumosPorId.get(item.insumo.toString());

        return {
            ...item,
            qtdLiquida: converterQuantidadeInsumoParaBase(item.qtdLiquida, insumo),
        };
    });

    // calcula custo
    const custoTotal = await calcularCusto({
        ingredientes,
        empresaId,
        campoQuantidade: "qtdLiquida",
    });

    const valorUnitario = Number((custoTotal / rendimento).toFixed(6));

    // cria transformado
    const novo = await Insumo.create({
        empresaId: empresaId,

        nome,
        categoria,
        unidade,

        qtdBruta: rendimento,
        qtdLiquida: rendimento,

        rendimento: 1,
        rendimentoPercentual: 100,

        valorTotal: round(custoTotal),

        valorUnitario,

        tipo: "transformado",

        transformacao: {
            ingredientes: ingredientes.map((i) => ({
                insumo: i.insumo,

                qtdLiquida: i.qtdLiquida,
            })),
        },
    });

    return {
        insumo: mapInsumo(novo.toObject()),

        custoTotal: round(custoTotal),
    };
};
