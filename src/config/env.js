import "dotenv/config";

const obrigatorias = ["MONGO_URI", "JWT_SECRET"];

const ausentes = obrigatorias.filter((nome) => !process.env[nome]?.trim());

if (ausentes.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${ausentes.join(", ")}`);
}

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT deve ser um número inteiro entre 1 e 65535");
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const origensPadraoDesenvolvimento = "http://localhost:5173,http://127.0.0.1:5173";
const corsOrigins = (
    process.env.CORS_ORIGINS ?? (nodeEnv === "development" ? origensPadraoDesenvolvimento : "")
)
    .split(",")
    .map((origem) => origem.trim())
    .filter(Boolean);

if (nodeEnv === "production" && corsOrigins.length === 0) {
    throw new Error("CORS_ORIGINS é obrigatória em produção");
}

if (nodeEnv === "production" && process.env.JWT_SECRET.trim().length < 32) {
    throw new Error("JWT_SECRET deve possuir pelo menos 32 caracteres em produção");
}

function obterInteiroPositivo(nome, valorPadrao) {
    const valor = Number(process.env[nome] ?? valorPadrao);

    if (!Number.isInteger(valor) || valor <= 0) {
        throw new Error(`${nome} deve ser um número inteiro maior que zero`);
    }

    return valor;
}

export const env = Object.freeze({
    nodeEnv,
    port,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    corsOrigins,
    jsonLimit: process.env.JSON_LIMIT ?? "100kb",
    rateLimitWindowMs: obterInteiroPositivo("RATE_LIMIT_WINDOW_MS", 900000),
    rateLimitMax: obterInteiroPositivo("RATE_LIMIT_MAX", 500),
    authRateLimitMax: obterInteiroPositivo("AUTH_RATE_LIMIT_MAX", 20),
});
