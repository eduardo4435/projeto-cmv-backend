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
    }
}, {
    timestamps: true
});

export default mongoose.model("Produto", produtoSchema);