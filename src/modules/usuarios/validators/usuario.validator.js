import AppError from "#shared/errors/AppError.js";
import { exigirSenhaNumerica } from "#shared/validators/senha.validator.js";
import { cargosAtribuiveis } from "#shared/auth/permissoes.js";

export const validarCriarUsuario = (req, res, next) => {
    const { nome, email, senha, cargo } = req.body;

    if (!nome) {
        throw new AppError("Nome é obrigatório", 400);
    }

    if (!email) {
        throw new AppError("Email é obrigatório", 400);
    }

    if (!senha) {
        throw new AppError("Senha é obrigatória", 400);
    }

    exigirSenhaNumerica(senha);

    const emailNormalizado = String(email).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        throw new AppError("Email inválido", 400);
    }

    if (!cargo || !cargosAtribuiveis.includes(cargo)) {
        throw new AppError("Escolha um cargo válido para o funcionário", 400);
    }

    req.body = {
        ...req.body,
        nome: String(nome).trim(),
        email: emailNormalizado,
    };

    next();
};

export const validarAtualizarUsuario = (req, res, next) => {
    const { nome, cargo, ativo } = req.body;

    if (nome === undefined && cargo === undefined && ativo === undefined) {
        throw new AppError("Nenhum dado enviado", 400);
    }

    if (cargo !== undefined && !cargosAtribuiveis.includes(cargo)) {
        throw new AppError("Cargo inválido", 400);
    }

    if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
        throw new AppError("Nome inválido", 400);
    }

    if (ativo !== undefined && typeof ativo !== "boolean") {
        throw new AppError("Ativo deve ser verdadeiro ou falso", 400);
    }

    next();
};
