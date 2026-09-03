import { rateLimit } from "express-rate-limit";
import AppError from "#shared/errors/AppError.js";
import { responderErro } from "#shared/http/resposta.js";
import { env } from "../../config/env.js";

export const corsOptions = {
    origin(origem, callback) {
        if (!origem || env.corsOrigins.includes(origem)) {
            return callback(null, true);
        }

        return callback(new AppError("Origem não permitida pelo CORS", 403));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

const criarLimitador = (max, message) =>
    rateLimit({
        windowMs: env.rateLimitWindowMs,
        max,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler: (_req, res) => responderErro(res, 429, message),
    });

export const limitadorGlobal = criarLimitador(
    env.rateLimitMax,
    "Muitas requisições. Tente novamente mais tarde."
);

export const limitadorAutenticacao = criarLimitador(
    env.authRateLimitMax,
    "Muitas tentativas de autenticação. Tente novamente mais tarde."
);
