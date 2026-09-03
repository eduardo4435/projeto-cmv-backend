import Insumo from "../models/insumo.model.js";
import FichaTecnica from "../../fichaTecnica/models/fichaTecnica.model.js";
import AppError from "#shared/errors/AppError.js";

export const deletarInsumoService = async (id, empresaId) => {
    const existe = await FichaTecnica.exists({
        empresaId,
        "ingredientes.insumo": id,
    });

    if (existe) {
        throw new AppError("Insumo está sendo usado em uma ficha", 409);
    }

    const insumo = await Insumo.findOneAndDelete({ _id: id, empresaId });

    if (!insumo) {
        throw new AppError("Insumo não encontrado", 404);
    }

    return true;
};
