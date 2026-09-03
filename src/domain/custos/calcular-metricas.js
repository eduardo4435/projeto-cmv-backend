import { round } from "#shared/utils/round-number.js";

export const calcularMetricas = (preco, custo) => {
    const lucro = preco - custo;

    const cmv = preco > 0 ? (custo / preco) * 100 : 0;
    const margem = preco > 0 ? (lucro / preco) * 100 : 0;

    return {
        lucro: round(lucro),
        cmv: round(cmv),
        margem: round(margem)
    };
};