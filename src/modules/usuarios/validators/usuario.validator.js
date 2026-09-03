import AppError from "#shared/errors/AppError.js";

export const validarCriarUsuario = (req, res, next) => {
    const { nome, email, senha } = req.body;

    if (!nome) {
        throw new AppError("Nome é obrigatório", 400);
    }

    if (!email) {
        throw new AppError("Email é obrigatório", 400);
    }

    if (!senha) {
        throw new AppError("Senha é obrigatória", 400);
    }

    if (typeof senha !== "string" || senha.length < 8) {
        throw new AppError("Senha deve ter no mínimo 8 caracteres", 400);
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        throw new AppError("Email inválido", 400);
    }

    if (req.body.cargo && !["admin", "funcionario"].includes(req.body.cargo)) {
        throw new AppError("Cargo inválido", 400);
    }

    req.body = {
        ...req.body,
        nome: String(nome).trim(),
        email: emailNormalizado,
    };

    next();
};

export const validarAtualizarUsuario = (req, res, next) => {
    const { nome, cargo } = req.body;

    if (!nome && !cargo) {
        throw new AppError("Nenhum dado enviado", 400);
    }

    if (cargo && !["admin", "funcionario"].includes(cargo)) {
        throw new AppError("Cargo inválido", 400);
    }

    next();
};
