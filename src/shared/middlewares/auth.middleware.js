import jwt from "jsonwebtoken";
import Usuario from "#modules/usuarios/models/usuario.model.js";
import { cargos } from "#shared/auth/permissoes.js";

import AppError from "#shared/errors/AppError.js";
import { env } from "../../config/env.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError("Token não informado", 401);
    }

    const [esquema, token] = authHeader.trim().split(/\s+/);

    if (esquema !== "Bearer" || !token) {
        throw new AppError("Formato do token inválido", 401);
    }

    let decoded;
    try {
        decoded = jwt.verify(token, env.jwtSecret, {
            algorithms: ["HS256"],
        });
    } catch {
        throw new AppError("Token inválido", 401);
    }

    const empresaId =
        typeof decoded?.empresaId === "string" ? decoded.empresaId : decoded?.empresaId?._id;
    if (typeof decoded !== "object" || !decoded.id || typeof empresaId !== "string") {
        throw new AppError("Token inválido", 401);
    }

    // O cargo do token pode estar desatualizado. O banco decide o acesso atual.
    const usuario = await Usuario.findOne({
        _id: decoded.id,
        empresaId,
        ativo: { $ne: false },
    }).select("nome email cargo empresaId ativo");

    if (!usuario || !cargos.includes(usuario.cargo)) {
        throw new AppError("Usuário desativado ou não encontrado", 401);
    }

    req.usuario = {
        id: String(usuario._id),
        empresaId: String(usuario.empresaId),
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
    };
    return next();
};

export default authMiddleware;
