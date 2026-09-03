import AppError from "#shared/errors/AppError.js";

export const validarCriacaoFicha = ({ nome, categoria, ingredientes }) => {
    // nome
    if (!nome) {
        throw new AppError("Nome é obrigatório", 400);
    }

    if (typeof nome !== "string" || !nome.trim()) {
        throw new AppError("Nome inválido", 400);
    }

    // categoria
    if (!categoria) {
        throw new AppError("Categoria é obrigatória", 400);
    }

    if (typeof categoria !== "string" || !categoria.trim()) {
        throw new AppError("Categoria inválida", 400);
    }

    // ingredientes
    if (!ingredientes) {
        throw new AppError("Ingredientes são obrigatórios", 400);
    }

    if (!Array.isArray(ingredientes)) {
        throw new AppError("Ingredientes inválidos", 400);
    }

    if (ingredientes.length === 0) {
        throw new AppError("A ficha deve ter ingredientes", 400);
    }

    // validar cada ingrediente
    for (const item of ingredientes) {
        if (!item.insumo) {
            throw new AppError("Ingrediente sem insumo", 400);
        }

        const quantidade = Number(item.quantidade);

        if (isNaN(quantidade)) {
            throw new AppError("Quantidade inválida", 400);
        }

        if (quantidade <= 0) {
            throw new AppError("Quantidade deve ser maior que zero", 400);
        }
    }
};
