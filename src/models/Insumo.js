import mongoose from "mongoose";

const insumoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    unidade: {
        type: String,
        required: true // kg, g, litro, unidade
    },
    custo: {
        type: Number,
        required: true // custo por unidade (ex: 1kg = 40 reais)
    },
    rendimento: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

export default mongoose.model("Insumo", insumoSchema);