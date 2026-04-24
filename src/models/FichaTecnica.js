import mongoose from "mongoose";

const fichaSchema = new mongoose.Schema({
    produto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produto",
        required: true
    },

    ingredientes: [
        {
            insumo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Insumo",
                required: true
            },
            quantidade: {
                type: Number,
                required: true
            }
        }
    ],

    custoTotal: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

export default mongoose.model("FichaTecnica", fichaSchema);