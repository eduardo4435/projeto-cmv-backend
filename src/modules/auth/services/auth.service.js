import Usuario from "#modules/usuarios/models/usuario.model.js";

import Empresa from "#modules/empresa/models/empresa.model.js";

import { hashPassword, comparePassword } from "#shared/utils/hash-password.js";

import { generateToken } from "#shared/utils/generate-token.js";

import AppError from "#shared/errors/AppError.js";

import { executarTransacao } from "#shared/database/executar-transacao.js";
import { permissoesDoCargo } from "#shared/auth/permissoes.js";

export const register = async (dados) => {
    // criptografa senha
    const senhaHash = await hashPassword(dados.senha);

    const { empresa, usuario } = await executarTransacao(async (sessao) => {
        // O cadastro público só cria empresas novas. Funcionários são criados por um usuário autorizado.
        const empresaEncontrada = await Empresa.findOne({
            cnpj: dados.cnpj,
        }).session(sessao);

        if (empresaEncontrada) {
            throw new AppError("Empresa já cadastrada. Peça acesso ao responsável.", 409);
        }

        const [novaEmpresa] = await Empresa.create([{ nome: dados.empresa, cnpj: dados.cnpj }], {
            session: sessao,
        });

        const [usuarioCriado] = await Usuario.create(
            [
                {
                    nome: dados.nome,
                    email: dados.email,
                    senha: senhaHash,
                    cargo: "admin",
                    empresaId: novaEmpresa._id,
                },
            ],
            { session: sessao }
        );

        return {
            empresa: novaEmpresa,
            usuario: usuarioCriado,
        };
    });

    // gera token
    const token = generateToken(usuario);

    return {
        usuario: {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            cargo: usuario.cargo,
            ativo: usuario.ativo,
            permissoes: permissoesDoCargo(usuario.cargo),

            empresa: {
                id: empresa._id,
                nome: empresa.nome,
            },
        },

        token,
    };
};

export const login = async ({ email, senha }) => {
    const usuario = await Usuario.findOne({ email }).select("+senha").populate("empresaId");

    if (!usuario) {
        throw new AppError("Email ou senha inválidos", 401);
    }

    const senhaCorreta = await comparePassword(senha, usuario.senha);

    if (!senhaCorreta) {
        throw new AppError("Email ou senha inválidos", 401);
    }

    if (usuario.ativo === false || !usuario.empresaId || usuario.empresaId.status === "inativa") {
        throw new AppError("Acesso desativado. Procure o responsável.", 403);
    }

    const token = generateToken(usuario);

    return {
        usuario: {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            cargo: usuario.cargo,
            ativo: usuario.ativo,
            permissoes: permissoesDoCargo(usuario.cargo),

            empresa: {
                id: usuario.empresaId._id,
                nome: usuario.empresaId.nome,
            },
        },

        token,
    };
};
