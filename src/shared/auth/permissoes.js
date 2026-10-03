export const cargos = Object.freeze([
    "admin",
    "gerente",
    "caixa",
    "garcom",
    "cozinha",
    "funcionario", // cargo anterior, mantido para usuários já cadastrados
]);

export const cargosAtribuiveis = Object.freeze(["gerente", "caixa", "garcom", "cozinha"]);

const porCargo = {
    admin: [
        "usuarios:ler",
        "usuarios:gerir",
        "cmv:ler",
        "cmv:gerir",
        "fichas:consultar",
        "catalogo:ler",
        "catalogo:gerir",
    ],
    gerente: [
        "usuarios:ler",
        "usuarios:gerir",
        "cmv:ler",
        "cmv:gerir",
        "fichas:consultar",
        "catalogo:ler",
        "catalogo:gerir",
    ],
    caixa: ["catalogo:ler"],
    garcom: ["catalogo:ler"],
    cozinha: ["catalogo:ler", "fichas:consultar"],
    funcionario: ["cmv:ler", "fichas:consultar", "catalogo:ler"],
};

export const permissoesDoCargo = (cargo) => porCargo[cargo] || [];

export const temPermissao = (cargo, permissao) => permissoesDoCargo(cargo).includes(permissao);
