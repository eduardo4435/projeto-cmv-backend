import mongoose from "mongoose";

const produtoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    preco: {
        type: Number,
        required: true
    },
    estoque: {
        type: Number,
        default: 0
    },
    tipo: {
        type: String,
        enum: ["bebida", "comida"],
        required: true,
        default: "comida"
    },
    categoria: {
        type: String,
        enum: [
            // bebidas
            "soft drinks",
            "cervejas 600ml",
            "drinks",
            "destilados garrafa",
            "destilados doses",
            "chopp",

            // comidas
            "entradas",
            "classicos da casa",
            "sugestao do chefe",
            "petiscos",
            "linguicas",
            "sanduiches",
            "grelhados",
            "espetos",
            "acompanhamentos",
            "sobremesas"
        ],
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model("Produto", produtoSchema);