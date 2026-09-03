import AppError from "#shared/errors/AppError.js";

export const validarCriacaoTransformado = ({
    nome,
    categoria,
    unidade,
    rendimento,
    ingredientes,
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

    // rendimento
    const rendimentoConvertido = Number(rendimento);

    if (isNaN(rendimentoConvertido)) {
        throw new AppError("Rendimento inválido", 400);
    }

    if (rendimentoConvertido <= 0) {
        throw new AppError("Rendimento deve ser maior que zero", 400);
    }

    // ingredientes
    if (!Array.isArray(ingredientes)) {
        throw new AppError("Ingredientes inválidos", 400);
    }

    if (ingredientes.length === 0) {
        throw new AppError("O transformado deve ter ingredientes", 400);
    }

    // validar ingredientes
    for (const item of ingredientes) {
        if (!item.insumo) {
            throw new AppError("Ingrediente sem insumo", 400);
        }

        const qtdLiquida = Number(item.qtdLiquida);

        if (isNaN(qtdLiquida)) {
            throw new AppError("Quantidade inválida", 400);
        }

        if (qtdLiquida <= 0) {
            throw new AppError("Quantidade deve ser maior que zero", 400);
        }
    }
};
