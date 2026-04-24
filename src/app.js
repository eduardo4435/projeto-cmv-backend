import express from "express";
import cors from "cors";

// importa as rotas criadas
import produtoRoutes from "./routes/produtoRoutes.js";
import insumoRoutes from "./routes/insumoRoutes.js";
import fichaTecnicaRoutes from "./routes/fichaTecnicaRoutes.js";
import processamentoRoutes from "./routes/processamentoRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// usa as rotas
app.use("/produtos", produtoRoutes);
app.use("/insumos", insumoRoutes);
app.use("/fichas", fichaTecnicaRoutes);
app.use("/processamento", processamentoRoutes);

// rota de teste
app.get("/", (req, res) => {
    res.send("API rodando");
});

export default app;