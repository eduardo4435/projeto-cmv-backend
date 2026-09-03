import Usuario from "../../usuarios/models/usuario.model.js";

import AppError from "#shared/errors/AppError.js";

export const validarRegister = async (req, res, next) => {
    const { empresa, cnpj, nome, email, senha } = req.body;

    if (!empresa) {
        throw new AppError("Empresa é obrigatória", 400);
    }

    if (!cnpj) {
        throw new AppError("CNPJ é obrigatório", 400);
    }

    if (!nome) {
        throw new AppError("Nome é obrigatório", 400);
    }

    if (!email) {
        throw new AppError("Email é obrigatório", 400);
    }

    if (!senha) {
        throw new AppError("Senha é obrigatória", 400);
    }

    if (typeof senha !== "string" || senha.length < 4) {
        throw new AppError("Senha deve ter no mínimo 4 caracteres", 400);
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        throw new AppError("Email inválido", 400);
    }

    req.body = {
        ...req.body,
        empresa: String(empresa).trim(),
        cnpj: String(cnpj).trim(),
        nome: String(nome).trim(),
        email: emailNormalizado,
    };

    // email duplicado
    const usuarioExiste = await Usuario.findOne({
        email: emailNormalizado,
    });

    if (usuarioExiste) {
        throw new AppError("Email já cadastrado", 409);
    }

    next();
};

export const validarLogin = (req, res, next) => {
    const { email, senha } = req.body;

    if (!email) {
        throw new AppError("Email é obrigatório", 400);
    }

    if (!senha) {
        throw new AppError("Senha é obrigatória", 400);
    }

    req.body = {
        ...req.body,
        email: String(email).trim().toLowerCase(),
    };

    next();
};
