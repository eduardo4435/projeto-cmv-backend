import {
    obterUnidadeExibicao,
    converterParaExibicao,
    converterValorUnitarioParaExibicao,
} from "#domain/estoque/unidades.js";

export function mapInsumo(insumo) {
    const unidadeExibicao = obterUnidadeExibicao(insumo.unidade);

    const unidadePesoExibicao = insumo.unidadePesoUnitario
        ? obterUnidadeExibicao(insumo.unidadePesoUnitario)
        : null;

    let qtdBruta = converterParaExibicao(insumo.unidade, insumo.qtdBruta);

    let qtdLiquida = converterParaExibicao(insumo.unidade, insumo.qtdLiquida);

    const valorUnitario = converterValorUnitarioParaExibicao(insumo.valorUnitario, insumo.unidade);

    // Quando for unidade, exibe novamente a quantidade de unidades
    if (insumo.unidade === "un" && insumo.pesoUnitario) {
        qtdBruta = Number((insumo.qtdBruta / insumo.pesoUnitario).toFixed(3));

        qtdLiquida = Number((insumo.qtdLiquida / insumo.pesoUnitario).toFixed(3));
    }

    return {
        ...insumo,

        valorUnitario,
        unidade: unidadeExibicao,

        unidadePesoUnitario: unidadePesoExibicao,

        pesoUnitario:
            insumo.pesoUnitario != null
                ? converterParaExibicao(insumo.unidadePesoUnitario, insumo.pesoUnitario)
                : null,

        qtdBruta,

        qtdLiquida,
    };
}
