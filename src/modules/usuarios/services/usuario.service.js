import Usuario from "../models/usuario.model.js";

import { hashPassword } from "#shared/utils/hash-password.js";

import AppError from "#shared/errors/AppError.js";

export const listarUsuarios = async (empresaId) => {
    return await Usuario.find({
        empresaId: empresaId,
    })
        .select("-senha")
        .sort({ createdAt: -1 });
};

export const criarUsuario = async (dados, empresaId) => {
    const usuarioExiste = await Usuario.findOne({
        email: dados.email,
        empresaId: empresaId,
    });

    if (usuarioExiste) {
        throw new AppError("Usuário já cadastrado", 409);
    }

    const senhaHash = await hashPassword(dados.senha);

    const usuario = await Usuario.create({
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,

        cargo: dados.cargo || "funcionario",

        empresaId: empresaId,
    });

    const usuarioSeguro = usuario.toObject();
    delete usuarioSeguro.senha;

    return usuarioSeguro;
};

export const atualizarUsuario = async (id, dados, empresaId) => {
    const usuario = await Usuario.findOne({
        _id: id,
        empresaId: empresaId,
    });

    if (!usuario) {
        throw new AppError("Usuário não encontrado", 404);
    }

    if (dados.nome) {
        usuario.nome = dados.nome;
    }

    if (dados.cargo) {
        usuario.cargo = dados.cargo;
    }

    await usuario.save();

    return usuario;
};

export const deletarUsuario = async (id, empresaId) => {
    const usuario = await Usuario.findOne({
        _id: id,
        empresaId: empresaId,
    });

    if (!usuario) {
        throw new AppError("Usuário não encontrado", 404);
    }

    await usuario.deleteOne();
};
