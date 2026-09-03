import Insumo from "../models/insumo.model.js";
import FichaTecnica from "../../fichaTecnica/models/fichaTecnica.model.js";
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
} from "./insumo.helpers.js";

export const atualizarInsumoService = async (id, data, empresaId) => {
    data = normalizarDadosInsumo(data);

    const { nome, categoria, transformacao } = data;
    let { unidade, qtdBruta, qtdLiquida, valorTotal, pesoUnitario, unidadePesoUnitario } = data;

    validarCriacaoInsumo({
        nome,
        categoria,
        unidade,
        qtdBruta,
        qtdLiquida,
        valorTotal,
        pesoUnitario,
    });

    const nomeExistente = await Insumo.findOne({
        nome,
        empresaId,
        _id: { $ne: id },
    });

    if (nomeExistente) {
        throw new AppError("Nome já existe", 409);
    }

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

    const indicadores = calcularIndicadores(qtdBruta, qtdLiquida, valorTotal);
    valorTotal = round(valorTotal);

    const insumo = await executarTransacao(async (sessao) => {
        const insumoAtualizado = await Insumo.findOneAndUpdate(
            { _id: id, empresaId },
            {
                nome,
                categoria,
                unidade,
                pesoUnitario,
                qtdBruta,
                qtdLiquida,
                ...indicadores,
                valorTotal,
                unidadePesoUnitario,
                transformacao,
            },
            { new: true, session: sessao }
        );

        if (!insumoAtualizado) {
            throw new AppError("Insumo não encontrado", 404);
        }

        const fichas = await FichaTecnica.find({
            empresaId,
            "ingredientes.insumo": insumoAtualizado._id,
        })
            .session(sessao)
            .populate("ingredientes.insumo");

        for (const ficha of fichas) {
            ficha.custoTotal = ficha.ingredientes.reduce(
                (total, item) =>
                    total + (item.insumo ? item.insumo.valorUnitario * item.quantidade : 0),
                0
            );
            await ficha.save({ session: sessao });
        }

        return insumoAtualizado;
    });

    return mapInsumo(insumo.toObject());
};
