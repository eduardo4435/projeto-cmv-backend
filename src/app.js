//express
import express from "express";
import cors from "cors";
import helmet from "helmet";

// middlewares
import notFound from "#shared/middlewares/not-found.js";
import errorHandler from "#shared/middlewares/error-handler.js";
import {
    corsOptions,
    limitadorAutenticacao,
    limitadorGlobal,
} from "#shared/middlewares/security.middleware.js";
import { env } from "./config/env.js";

//
import authRoutes from "#modules/auth/routes/auth.routes.js";
import produtoRoutes from "#modules/produtos/routes/produto.routes.js";
import insumoRoutes from "#modules/insumos/routes/insumo.routes.js";
import fichaTecnicaRoutes from "#modules/fichaTecnica/routes/fichaTecnica.routes.js";
import transformadosRoutes from "#modules/transformados/routes/transformados.routes.js";
import usuarioRoutes from "#modules/usuarios/routes/usuarios.routes.js";

const app = express(); // ativa app

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(limitadorGlobal);
app.use(express.json({ limit: env.jsonLimit }));

// rota raiz
app.get("/", (req, res) => {
    res.send("API rodando");
});

// endpoints
app.use("/auth", limitadorAutenticacao, authRoutes);
app.use("/produtos", produtoRoutes);
app.use("/insumos", insumoRoutes);
app.use("/fichas", fichaTecnicaRoutes);
app.use("/transformados", transformadosRoutes);
app.use("/usuarios", usuarioRoutes);

//rota não encontrada
app.use(notFound);

// erro global interno
app.use(errorHandler);

export default app;
