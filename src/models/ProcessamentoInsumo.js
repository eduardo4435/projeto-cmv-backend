import mongoose from "mongoose";

const porcionamentoSchema = new mongoose.Schema({
    nome: String, // ex: Steak, Grelhado

    quantidadeUsada: Number, // kg usado desse rendimento
    pesoPorcao: Number, // kg por porção

    totalPorcoes: Number,
    sobra: Number,

    valorUnitario: Number // custo por kg desse corte
});

const processamentoSchema = new mongoose.Schema({
    insumoBase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Insumo",
        required: true
    },

    fornecedor: String,

    qtdBruta: Number,
    qtdLiquida: Number,
    rendimento: Number,

    valorTotal: Number,
    valorUnitarioBase: Number, // custo por kg da maminha limpa

    porcionamentos: [porcionamentoSchema]

}, { timestamps: true });

export default mongoose.model("ProcessamentoInsumo", processamentoSchema);