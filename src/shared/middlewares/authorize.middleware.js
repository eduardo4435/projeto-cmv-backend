import AppError from "#shared/errors/AppError.js";
import { temPermissao } from "#shared/auth/permissoes.js";

const authorize = (permissao) => {
    return (req, res, next) => {
        if (!req.usuario) {
            throw new AppError("Usuário não autenticado", 401);
        }

        const autorizado = temPermissao(req.usuario.cargo, permissao);

        if (!autorizado) {
            throw new AppError("Acesso negado", 403);
        }

        next();
    };
};

export default authorize;
