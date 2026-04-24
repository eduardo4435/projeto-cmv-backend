import mongoose from "mongoose";

const insumoSchema = new mongoose.Schema({
    nome: String,
    categoria: String,
    unidade: String,

    fornecedor: {
        type: String
    },

    qtdBruta: Number,
    qtdLiquida: Number,

    rendimento: Number,
    rendimentoPercentual: Number,

    valorTotal: Number,
    valorUnitario: Number,

    tipo: {
        type: String,
        enum: ["base", "processado"],
        default: "base"
    },

    origem: {
        insumoPai: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Insumo"
        },
        quantidadeUsada: Number
    }

}, { timestamps: true });

export default mongoose.model("Insumo", insumoSchema);