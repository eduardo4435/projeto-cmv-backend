import AppError from "#shared/errors/AppError.js";

export const escaparRegex = (valor = "") => valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const obterOpcoesListagem = (query = {}) => {
    const paginado = query.page != null || query.limit != null;

    if (!paginado) {
        return {
            paginado: false,
            search: String(query.search || "").trim(),
            categoria: String(query.categoria || "").trim(),
            tipo: String(query.tipo || "").trim(),
        };
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    if (!Number.isInteger(page) || page < 1) {
        throw new AppError("Página inválida", 400);
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new AppError("Limite deve estar entre 1 e 100", 400);
    }

    return {
        paginado: true,
        page,
        limit,
        skip: (page - 1) * limit,
        search: String(query.search || "").trim(),
        categoria: String(query.categoria || "").trim(),
        tipo: String(query.tipo || "").trim(),
    };
};

export const criarMetadadosPaginacao = ({ page, limit, total }) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
});
