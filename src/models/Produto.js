import mongoose from "mongoose";

const produtoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },

    categoria: {
        type: String,
        required: true
    },

    preco: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

export default mongoose.model("Produto", produtoSchema);