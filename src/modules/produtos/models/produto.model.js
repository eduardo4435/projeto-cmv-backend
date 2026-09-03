import mongoose from "mongoose";

const produtoSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
            trim: true,
        },

        categoria: {
            type: String,
            required: true,
            trim: true,
        },

        preco: {
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

produtoSchema.index({ empresaId: 1, createdAt: -1 }, { name: "empresa_criacao" });

export default mongoose.model("Produto", produtoSchema);
