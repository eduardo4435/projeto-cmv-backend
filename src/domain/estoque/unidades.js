import AppError from "#shared/errors/AppError.js";

const UNIDADES_BASE = {
    kg: "g",
    g: "g",
    l: "ml",
    ml: "ml",
    un: "un",
};

const UNIDADES_EXIBICAO = {
    g: "kg",
    kg: "kg",
    ml: "l",
    l: "l",
    un: "un",
};

export function normalizarUnidade(unidade) {
    if (typeof unidade !== "string") {
        throw new AppError("Unidade inválida.", 400);
    }

    const unidadeNormalizada = unidade.trim().toLowerCase();

    if (!UNIDADES_BASE[unidadeNormalizada]) {
        throw new AppError("Unidade inválida.", 400);
    }

    return unidadeNormalizada;
}

function normalizarQuantidade(quantidade) {
    const valor = Number(quantidade);

    if (!Number.isFinite(valor)) {
        throw new AppError("Quantidade inválida.", 400);
    }

    return valor;
}

export function obterUnidadeBase(unidade) {
    return UNIDADES_BASE[normalizarUnidade(unidade)];
}

export function obterUnidadeExibicao(unidade) {
    return UNIDADES_EXIBICAO[normalizarUnidade(unidade)];
}

export function converterParaBase(unidade, quantidade, pesoUnitario = null) {
    const unidadeNormalizada = normalizarUnidade(unidade);
    const valor = normalizarQuantidade(quantidade);

    if (unidadeNormalizada === "kg" || unidadeNormalizada === "l") {
        return valor * 1000;
    }

    if (unidadeNormalizada === "g" || unidadeNormalizada === "ml") {
        return valor;
    }

    const peso = Number(pesoUnitario);

    if (!Number.isFinite(peso) || peso <= 0) {
        throw new AppError(
            "Peso unitário inválido para conversão.",
            400
        );
    }

    return valor * peso;
}

export function converterParaExibicao(unidade, quantidade) {
    if (quantidade == null) {
        return quantidade;
    }

    const unidadeNormalizada = normalizarUnidade(unidade);
    const valor = normalizarQuantidade(quantidade);

    if (unidadeNormalizada === "g" || unidadeNormalizada === "ml") {
        return Number((valor / 1000).toFixed(3));
    }

    return valor;
}

export function obterUnidadeUsoInsumo(insumo) {
    if (
        insumo?.unidade === "un" &&
        Number(insumo?.pesoUnitario) > 0 &&
        insumo?.unidadePesoUnitario
    ) {
        return obterUnidadeExibicao(insumo.unidadePesoUnitario);
    }

    return obterUnidadeExibicao(insumo?.unidade);
}

export function converterQuantidadeInsumoParaBase(quantidade, insumo) {
    const unidadeUso = obterUnidadeUsoInsumo(insumo);

    if (unidadeUso === "un") {
        return normalizarQuantidade(quantidade);
    }

    return converterParaBase(unidadeUso, quantidade);
}

export function converterQuantidadeInsumoParaExibicao(quantidade, insumo) {
    const unidadeBase =
        insumo?.unidade === "un" &&
        Number(insumo?.pesoUnitario) > 0 &&
        insumo?.unidadePesoUnitario
            ? insumo.unidadePesoUnitario
            : insumo?.unidade;

    return converterParaExibicao(unidadeBase, quantidade);
}

export function converterValorUnitarioParaExibicao(valorUnitario, unidade) {
    const valor = normalizarQuantidade(valorUnitario);
    const unidadeNormalizada = normalizarUnidade(unidade);

    if (unidadeNormalizada === "g" || unidadeNormalizada === "ml") {
        return Number((valor * 1000).toFixed(6));
    }

    return valor;
}
