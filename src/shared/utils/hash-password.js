import bcrypt from "bcryptjs";

export const hashPassword = async (senha) => {
    return bcrypt.hash(senha, 10);
};

export const comparePassword = async (senha, hash) => {
    return bcrypt.compare(senha, hash);
};
