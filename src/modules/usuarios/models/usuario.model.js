import mongoose from "mongoose";
import { cargos } from "#shared/auth/permissoes.js";

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
            enum: cargos,
            default: "funcionario",
        },

        ativo: {
            type: Boolean,
            default: true,
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
