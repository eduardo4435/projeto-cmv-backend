import mongoose from "mongoose";

const empresaSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
        },

        cnpj: {
            type: String,
            required: true,
            unique: true,
        },

        status: {
            type: String,
            enum: ["ativa", "inativa"],
            default: "ativa",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Empresa", empresaSchema);
