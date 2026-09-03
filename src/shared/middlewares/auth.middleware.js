import jwt from "jsonwebtoken";

import AppError from "#shared/errors/AppError.js";
import { env } from "../../config/env.js";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError("Token não informado", 401);
    }

    const [esquema, token] = authHeader.trim().split(/\s+/);

    if (esquema !== "Bearer" || !token) {
        throw new AppError("Formato do token inválido", 401);
    }

    try {
        const decoded = jwt.verify(token, env.jwtSecret, {
            algorithms: ["HS256"],
        });

        if (
            typeof decoded !== "object" ||
            !decoded.id ||
            !decoded.empresaId ||
            !["admin", "funcionario"].includes(decoded.cargo)
        ) {
            throw new Error("Payload inválido");
        }

        req.usuario = decoded;

        return next();
    } catch {
        throw new AppError("Token inválido", 401);
    }
};

export default authMiddleware;
