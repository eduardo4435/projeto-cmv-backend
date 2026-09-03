import { converterUnidade } from "#domain/estoque/converter-unidade.js";
import { obterUnidadeBase } from "#domain/estoque/unidades.js";

export function normalizarDadosInsumo(data) {
    return {
        ...data,
        qtdBruta: Number(data.qtdBruta),
        qtdLiquida: data.qtdLiquida != null ? Number(data.qtdLiquida) : null,
        valorTotal: Number(data.valorTotal),
        pesoUnitario: data.unidade === "un" ? Number(data.pesoUnitario) : null,
        unidadePesoUnitario: data.unidade === "un" ? data.unidadePesoUnitario : null,
    };
}

export function converterQuantidades(unidade, qtdBruta, qtdLiquida, pesoUnitario) {
    const qtdBrutaConvertida = converterUnidade(unidade, qtdBruta, pesoUnitario);
    const qtdLiquidaConvertida =
        qtdLiquida != null
            ? converterUnidade(unidade, qtdLiquida, pesoUnitario)
            : qtdBrutaConvertida;

    return {
        unidade: obterUnidadeBase(unidade),
        qtdBruta: qtdBrutaConvertida,
        qtdLiquida: qtdLiquidaConvertida,
    };
}

export function calcularIndicadores(qtdBruta, qtdLiquida, valorTotal) {
    const rendimento = Number((qtdLiquida / qtdBruta).toFixed(4));
    const rendimentoPercentual = Number((rendimento * 100).toFixed(2));
    const valorUnitario = Number((valorTotal / qtdLiquida).toFixed(6));

    return { rendimento, rendimentoPercentual, valorUnitario };
}

export function obterQuantidadeInicialFicha(insumo) {
    if (insumo.unidade === "g" || insumo.unidade === "ml") {
        return 1000;
    }

    if (insumo.unidade === "un" && Number(insumo.pesoUnitario) > 0) {
        return Number(insumo.pesoUnitario);
    }

    return 1;
}
