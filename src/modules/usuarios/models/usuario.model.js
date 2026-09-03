import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
        },

        senha: {
            type: String,
            required: true,
            trim: true,
            select: false,
        },

        cargo: {
            type: String,
            enum: ["admin", "funcionario"],
            default: "funcionario",
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

usuarioSchema.index({ empresaId: 1, createdAt: -1 }, { name: "empresa_criacao" });

export default mongoose.model("Usuario", usuarioSchema);
