import AppError from "#shared/errors/AppError.js";

export const senhaNumericaValida = (senha) =>
    typeof senha === "string" && /^[0-9]{4,}$/.test(senha);

export function exigirSenhaNumerica(senha) {
    if (!senhaNumericaValida(senha)) {
        throw new AppError("Senha deve conter somente números e ter no mínimo 4 dígitos", 400);
    }
}
