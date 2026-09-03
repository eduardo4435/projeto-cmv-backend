import Insumo from "#modules/insumos/models/insumo.model.js";
import AppError from "#shared/errors/AppError.js";
import validarObjectId from "#shared/validators/validar-object-id.js";

export const buscarInsumosEmpresa = async ({
    ingredientes,
    empresaId,
    mensagemNaoEncontrado = "Insumo não encontrado",
}) => {
    const idsUnicos = [
        ...new Set(
            ingredientes.map((item) => {
                validarObjectId(item.insumo);
                return item.insumo.toString();
            })
        ),
    ];

    const insumos = await Insumo.find({
        _id: { $in: idsUnicos },
        empresaId,
    })
        .select("_id unidade pesoUnitario unidadePesoUnitario valorUnitario")
        .lean();

    if (insumos.length !== idsUnicos.length) {
        throw new AppError(mensagemNaoEncontrado, 404);
    }

    return new Map(
        insumos.map((insumo) => [insumo._id.toString(), insumo])
    );
};
