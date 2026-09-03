import mongoose from "mongoose";

export async function executarTransacao(operacao) {
    const sessao = await mongoose.startSession();

    try {
        let resultado;

        await sessao.withTransaction(async () => {
            resultado = await operacao(sessao);
        });

        return resultado;
    } finally {
        await sessao.endSession();
    }
}
