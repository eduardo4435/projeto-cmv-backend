import Insumo from "#modules/insumos/models/insumo.model.js";
import { round } from "#shared/utils/round-number.js";
import AppError from "#shared/errors/AppError.js";

export const calcularCusto = async ({
    ingredientes,
    empresaId,
    campoQuantidade = "quantidade",
}) => {
    if (!empresaId) {
        throw new AppError("Empresa não informada para o cálculo", 400);
    }

    if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
        throw new AppError("Ingredientes inválidos", 400);
    }

    const ids = ingredientes.map((item) => item.insumo);

    const insumos = await Insumo.find({
        _id: { $in: ids },
        empresaId,
    })
        .select("_id valorUnitario")
        .lean();

    const mapaInsumos = new Map(
        insumos.map((insumo) => [insumo._id.toString(), insumo])
    );

    let total = 0;

    for (const item of ingredientes) {
        const insumo = mapaInsumos.get(item.insumo.toString());
        const quantidade = Number(item[campoQuantidade]);

        if (!insumo) {
            throw new AppError("Insumo não encontrado", 404);
        }

        if (!Number.isFinite(quantidade) || quantidade <= 0) {
            throw new AppError("Quantidade inválida", 400);
        }

        const valorUnitario = Number(insumo.valorUnitario);

        if (!Number.isFinite(valorUnitario) || valorUnitario < 0) {
            throw new AppError("Valor unitário do insumo inválido", 400);
        }

        total += valorUnitario * quantidade;
    }

    return round(total);
};
