import AppError from "#shared/errors/AppError.js";

const authorize = (...cargosPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            throw new AppError("Usuário não autenticado", 401);
        }

        const autorizado = cargosPermitidos.includes(req.usuario.cargo);

        if (!autorizado) {
            throw new AppError("Acesso negado", 403);
        }

        next();
    };
};

export default authorize;
