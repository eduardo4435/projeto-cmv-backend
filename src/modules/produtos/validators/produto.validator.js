import AppError from "#shared/errors/AppError.js";

export const validarCriacaoProduto = ({ nome, preco, categoria }) => {
    if (!nome) {
        throw new AppError("Nome é obrigatório", 400);
    }

    if (preco == null) {
        throw new AppError("Preço é obrigatório", 400);
    }

    if (!categoria) {
        throw new AppError("Categoria é obrigatória", 400);
    }

    if (typeof nome !== "string" || !nome.trim()) {
        throw new AppError("Nome inválido", 400);
    }

    if (typeof categoria !== "string" || !categoria.trim()) {
        throw new AppError("Categoria inválida", 400);
    }

    const precoConvertido = Number(preco);

    if (isNaN(precoConvertido)) {
        throw new AppError("Preço inválido", 400);
    }

    if (precoConvertido < 0) {
        throw new AppError("Preço não pode ser negativo", 400);
    }
};
