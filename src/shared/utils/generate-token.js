import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const generateToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario._id,
            cargo: usuario.cargo,
            empresaId: String(usuario.empresaId?._id || usuario.empresaId),
        },
        env.jwtSecret,
        {
            algorithm: "HS256",
            expiresIn: env.jwtExpiresIn,
        }
    );
};
