import Insumo from "../models/insumo.model.js";
import FichaTecnica from "../../fichaTecnica/models/fichaTecnica.model.js";
import Produto from "../../produtos/models/produto.model.js";
import { converterUnidade } from "#domain/estoque/converter-unidade.js";
import { obterUnidadeBase } from "#domain/estoque/unidades.js";
import { round } from "#shared/utils/round-number.js";
import AppError from "#shared/errors/AppError.js";
import { validarCriacaoInsumo } from "../validators/insumo.validator.js";
import { mapInsumo } from "#shared/mappers/insumo.mapper.js";
import { executarTransacao } from "#shared/database/executar-transacao.js";
import {
    calcularIndicadores,
    converterQuantidades,
    normalizarDadosInsumo,
    obterQuantidadeInicialFicha,
} from "./insumo.helpers.js";

export const criarInsumoService = async (data, empresaId, sessao = null) => {
    data = normalizarDadosInsumo(data);

    const { nome, categoria, valorTotal, fornecedor } = data;
    let { unidade, qtdBruta, qtdLiquida, pesoUnitario, unidadePesoUnitario } = data;

    validarCriacaoInsumo({
        nome,
        categoria,
        unidade,
        qtdBruta,
        qtdLiquida,
        valorTotal,
        pesoUnitario,
    });

    if (unidade === "un" && pesoUnitario != null) {
        pesoUnitario = converterUnidade(unidadePesoUnitario, pesoUnitario);
        unidadePesoUnitario = obterUnidadeBase(unidadePesoUnitario);
    }

    ({ unidade, qtdBruta, qtdLiquida } = converterQuantidades(
        unidade,
        qtdBruta,
        qtdLiquida,
        pesoUnitario
    ));

    if (qtdLiquida > qtdBruta) {
        throw new AppError("Quantidade líquida não pode ser maior que a quantidade bruta", 400);
    }

    const existe = await Insumo.findOne({ nome, empresaId }).session(sessao);

    if (existe) {
        throw new AppError("Nome já existe", 409);
    }

    const indicadores = calcularIndicadores(qtdBruta, qtdLiquida, valorTotal);
    const insumo = new Insumo({
        empresaId,
        nome,
        categoria,
        unidade,
        pesoUnitario,
        qtdBruta,
        qtdLiquida,
        ...indicadores,
        valorTotal: round(valorTotal),
        unidadePesoUnitario,
        fornecedor,
    });

    await insumo.save({ session: sessao });

    return mapInsumo(insumo.toObject());
};

export const criarInsumoComFichaService = async (data, empresaId) => {
    const { nome, categoria, precoVenda } = data;

    return executarTransacao(async (sessao) => {
        const insumo = await criarInsumoService(data, empresaId, sessao);
        const insumoBanco = await Insumo.findOne({
            _id: insumo._id,
            empresaId,
        }).session(sessao);

        if (!insumoBanco) {
            throw new AppError("Insumo recém-criado não encontrado", 500);
        }

        const quantidadeFicha = obterQuantidadeInicialFicha(insumoBanco);
        const custoTotal = round(Number(insumoBanco.valorUnitario) * quantidadeFicha);

        const [produto] = await Produto.create(
            [
                {
                    empresaId,
                    nome,
                    categoria,
                    preco: precoVenda ? round(precoVenda) : custoTotal,
                },
            ],
            { session: sessao }
        );
        const [ficha] = await FichaTecnica.create(
            [
                {
                    empresaId,
                    produto: produto._id,
                    ingredientes: [
                        {
                            insumo: insumo._id,
                            quantidade: quantidadeFicha,
                        },
                    ],
                    custoTotal,
                },
            ],
            { session: sessao }
        );

        return { insumo, produto, ficha };
    });
};
