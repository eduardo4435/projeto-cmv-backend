import Usuario from "../models/usuario.model.js";

import { hashPassword } from "#shared/utils/hash-password.js";

import AppError from "#shared/errors/AppError.js";
import { cargosAtribuiveis } from "#shared/auth/permissoes.js";

export const listarUsuarios = async (empresaId) => {
    return await Usuario.find({
        empresaId: empresaId,
    })
        .select("-senha")
        .sort({ createdAt: -1 });
};

function validarGestao(ator, usuario, cargoNovo, ativoNovo) {
    if (!["admin", "gerente"].includes(ator?.cargo)) {
        throw new AppError("Acesso negado", 403);
    }

    if (cargoNovo !== undefined && !cargosAtribuiveis.includes(cargoNovo)) {
        throw new AppError("O cargo informado não pode ser atribuído a um funcionário", 403);
    }

    if (usuario?.cargo === "admin") {
        if ((cargoNovo !== undefined && cargoNovo !== "admin") || ativoNovo === false) {
            throw new AppError(
                "O administrador responsável não pode ser desativado ou ter o cargo alterado",
                403
            );
        }
    }

    if (
        ator.cargo === "gerente" &&
        (usuario?.cargo === "admin" || usuario?.cargo === "gerente" || cargoNovo === "gerente")
    ) {
        throw new AppError("Gerente só pode gerir funcionários da equipe", 403);
    }

    if (usuario && String(usuario._id) === String(ator.id) && ativoNovo === false) {
        throw new AppError("Você não pode desativar a própria conta", 403);
    }
}

export const criarUsuario = async (dados, empresaId, ator) => {
    validarGestao(ator, null, dados.cargo);
    const usuarioExiste = await Usuario.findOne({
        email: dados.email,
    });

    if (usuarioExiste) {
        throw new AppError("Usuário já cadastrado", 409);
    }

    const senhaHash = await hashPassword(dados.senha);

    const usuario = await Usuario.create({
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,

        cargo: dados.cargo,

        empresaId: empresaId,
    });

    const usuarioSeguro = usuario.toObject();
    delete usuarioSeguro.senha;

    return usuarioSeguro;
};

export const atualizarUsuario = async (id, dados, empresaId, ator) => {
    const usuario = await Usuario.findOne({
        _id: id,
        empresaId: empresaId,
    });

    if (!usuario) {
        throw new AppError("Usuário não encontrado", 404);
    }

    validarGestao(ator, usuario, dados.cargo, dados.ativo);

    if (dados.nome) {
        usuario.nome = dados.nome;
    }

    if (dados.cargo) {
        usuario.cargo = dados.cargo;
    }

    if (dados.ativo !== undefined) {
        usuario.ativo = dados.ativo;
    }

    await usuario.save();

    return usuario;
};

export const deletarUsuario = async (id, empresaId, ator) => {
    const usuario = await Usuario.findOne({
        _id: id,
        empresaId: empresaId,
    });

    if (!usuario) {
        throw new AppError("Usuário não encontrado", 404);
    }

    validarGestao(ator, usuario, undefined, false);
    usuario.ativo = false;
    await usuario.save();
};
