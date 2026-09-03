import app from "./app.js";
import { connectDB, disconnectDB } from "./config/database.js";
import { env } from "./config/env.js";

const startServer = async () => {
    try {
        await connectDB(env.mongoUri);

        const server = app.listen(env.port, () => {
            console.log(`Servidor rodando na porta ${env.port}`);
        });

        const encerrar = async (sinal) => {
            console.log(`${sinal} recebido. Encerrando servidor...`);

            server.close(async () => {
                try {
                    await disconnectDB();
                    process.exit(0);
                } catch (error) {
                    console.error("Erro ao encerrar conexão com o banco:", error);
                    process.exit(1);
                }
            });
        };

        process.once("SIGTERM", () => encerrar("SIGTERM"));
        process.once("SIGINT", () => encerrar("SIGINT"));
    } catch (error) {
        console.error("Erro ao iniciar servidor:", error);
        process.exit(1);
    }
};

startServer();
