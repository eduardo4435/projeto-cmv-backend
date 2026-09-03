import mongoose from "mongoose";

const fichaSchema = new mongoose.Schema(
    {
        produto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produto",
            required: true,
        },

        ingredientes: [
            {
                insumo: {
                    type: mongoose.Schema.Types.ObjectId,

                    ref: "Insumo",

                    required: true,
                },

                quantidade: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],

        custoTotal: {
            type: Number,
            default: 0,
            min: 0,
        },

        empresaId: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "Empresa",

            required: true,
        },
    },
    {
        timestamps: true,
    }
);

fichaSchema.index(
    { empresaId: 1, produto: 1 },
    {
        unique: true,
        name: "empresa_produto_unico",
    }
);

fichaSchema.index({ empresaId: 1, "ingredientes.insumo": 1 }, { name: "empresa_ingrediente" });

export default mongoose.model("FichaTecnica", fichaSchema);
