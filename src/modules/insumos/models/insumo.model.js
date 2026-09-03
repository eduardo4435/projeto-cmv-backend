import mongoose from "mongoose";

const insumoSchema = new mongoose.Schema(
    {
        empresaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Empresa",
            required: true,
        },

        nome: {
            type: String,
            required: true,
        },

        categoria: {
            type: String,
            required: true,
        },

        unidade: {
            type: String,
            required: true,
        },

        pesoUnitario: {
            type: Number,
            default: null,
        },

        unidadePesoUnitario: {
            type: String,
            enum: ["g", "ml"],
            default: null,
        },

        fornecedor: {
            type: String,
        },

        qtdBruta: {
            type: Number,
            required: true,
        },

        qtdLiquida: {
            type: Number,
            required: true,
        },

        rendimento: {
            type: Number,
        },

        rendimentoPercentual: {
            type: Number,
        },

        valorTotal: {
            type: Number,
        },

        valorUnitario: {
            type: Number,
            default: null,
        },

        tipo: {
            type: String,
            enum: ["base", "transformado"],
            default: "base",
        },

        origem: {
            insumoPai: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Insumo",
            },

            quantidadeUsada: {
                type: Number,
            },
        },

        transformacao: {
            ingredientes: [
                {
                    insumo: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Insumo",
                    },

                    qtdLiquida: {
                        type: Number,
                    },
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

insumoSchema.index(
    { empresaId: 1, nome: 1 },
    {
        unique: true,
        name: "empresa_nome_unico",
    }
);

insumoSchema.index({ empresaId: 1, "origem.insumoPai": 1 }, { name: "empresa_insumo_pai" });

export default mongoose.model("Insumo", insumoSchema);
