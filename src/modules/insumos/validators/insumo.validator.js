import AppError from "#shared/errors/AppError.js";

function validarNumeroPositivo(valor, campo) {
    if (Number.isNaN(valor)) {
        throw new AppError(`${campo} inválido`, 400);
    }

    if (valor <= 0) {
        throw new AppError(`${campo} deve ser maior que zero`, 400);
    }
}

export const validarCriacaoInsumo = ({
    nome,
    categoria,
    unidade,
    qtdBruta,
    qtdLiquida,
    valorTotal,
    pesoUnitario,
}) => {
    // nome
    if (typeof nome !== "string" || !nome.trim()) {
        throw new AppError("Nome inválido", 400);
    }

    // categoria
    if (typeof categoria !== "string" || !categoria.trim()) {
        throw new AppError("Categoria inválida", 400);
    }

    // unidade
    if (typeof unidade !== "string" || !unidade.trim()) {
        throw new AppError("Unidade inválida", 400);
    }

    validarNumeroPositivo(qtdBruta, "Quantidade bruta");

    validarNumeroPositivo(valorTotal, "Valor total");

    if (qtdLiquida != null) {
        validarNumeroPositivo(qtdLiquida, "Quantidade líquida");
    }

    if (unidade === "un") {
        validarNumeroPositivo(pesoUnitario, "Peso unitário");
    }
};
