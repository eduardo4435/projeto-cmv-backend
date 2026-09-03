import Usuario from "#modules/usuarios/models/usuario.model.js";

import Empresa from "#modules/empresa/models/empresa.model.js";

import { hashPassword, comparePassword } from "#shared/utils/hash-password.js";

import { generateToken } from "#shared/utils/generate-token.js";

import AppError from "#shared/errors/AppError.js";

import { executarTransacao } from "#shared/database/executar-transacao.js";

export const register = async (dados) => {
    // criptografa senha
    const senhaHash = await hashPassword(dados.senha);

    const { empresa, usuario } = await executarTransacao(async (sessao) => {
        // procura empresa existente
        let empresaEncontrada = await Empresa.findOne({
            cnpj: dados.cnpj,
        }).session(sessao);

        // cria empresa se não existir
        if (!empresaEncontrada) {
            [empresaEncontrada] = await Empresa.create(
                [
                    {
                        nome: dados.empresa,
                        cnpj: dados.cnpj,
                    },
                ],
                { session: sessao }
            );
        }

        // primeiro usuário vira admin
        const quantidadeUsuarios = await Usuario.countDocuments({
            empresaId: empresaEncontrada._id,
        }).session(sessao);

        const cargo = quantidadeUsuarios === 0 ? "admin" : "funcionario";

        const [usuarioCriado] = await Usuario.create(
            [
                {
                    nome: dados.nome,
                    email: dados.email,
                    senha: senhaHash,
                    cargo,
                    empresaId: empresaEncontrada._id,
                },
            ],
            { session: sessao }
        );

        return {
            empresa: empresaEncontrada,
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

    const token = generateToken(usuario);

    return {
        usuario: {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            cargo: usuario.cargo,

            empresa: {
                id: usuario.empresaId._id,
                nome: usuario.empresaId.nome,
            },
        },

        token,
    };
};
