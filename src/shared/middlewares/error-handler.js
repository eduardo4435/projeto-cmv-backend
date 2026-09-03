import { responderErro } from "#shared/http/resposta.js";

const errorHandler = (err, req, res, _next) => {
    console.error(err);

    // AppError
    if (err.statusCode) {
        return responderErro(res, err.statusCode, err.message);
    }

    // ObjectId inválido do Mongo
    if (err.name === "CastError") {
        return responderErro(res, 400, "ID inválido");
    }

    // Duplicado Mongo
    if (err.code === 11000) {
        return responderErro(res, 409, "Registro duplicado");
    }

    // ValidationError do mongoose
    if (err.name === "ValidationError") {
        return responderErro(res, 400, "Erro de validação");
    }

    // erro genérico
    return responderErro(res, 500, "Erro interno do servidor");
};

export default errorHandler;
