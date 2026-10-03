import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { mock } from "node:test";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/teste";
process.env.JWT_SECRET = "chave-exclusiva-para-os-testes-automatizados-123";

const { env } = await import("../src/config/env.js");
const { generateToken } = await import("#shared/utils/generate-token.js");
const { default: authMiddleware } = await import("#shared/middlewares/auth.middleware.js");
const { default: Usuario } = await import("#modules/usuarios/models/usuario.model.js");
const { me } = await import("#modules/auth/controllers/auth.controller.js");

test("gera JWT com os dados mínimos do usuário", () => {
    const token = generateToken({
        _id: "usuario-1",
        cargo: "admin",
        empresaId: "empresa-1",
    });
    const payload = jwt.verify(token, env.jwtSecret, {
        algorithms: ["HS256"],
    });

    assert.equal(payload.id, "usuario-1");
    assert.equal(payload.cargo, "admin");
    assert.equal(payload.empresaId, "empresa-1");
});

test("JWT usa o ID da empresa mesmo quando o login populou a empresa", () => {
    const token = generateToken({
        _id: "usuario-1",
        cargo: "admin",
        empresaId: { _id: "empresa-1", nome: "Empresa" },
    });
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    assert.equal(payload.empresaId, "empresa-1");
});

test("aceita Bearer e consulta o cargo atual no banco", async () => {
    const token = generateToken({
        _id: "usuario-1",
        cargo: "funcionario",
        empresaId: "empresa-1",
    });
    const find = mock.method(Usuario, "findOne", () => ({
        select: async () => ({ _id: "usuario-1", empresaId: "empresa-1", cargo: "gerente" }),
    }));
    const req = {
        headers: { authorization: `Bearer ${token}` },
    };
    let chamouNext = false;

    try {
        await authMiddleware(req, {}, () => {
            chamouNext = true;
        });
    } finally {
        find.mock.restore();
    }

    assert.equal(chamouNext, true);
    assert.equal(req.usuario.empresaId, "empresa-1");
    assert.equal(req.usuario.cargo, "gerente");
});

test("rejeita token ausente ou fora do padrão Bearer", async () => {
    await assert.rejects(
        () => authMiddleware({ headers: {} }, {}, () => {}),
        /Token não informado/
    );
    await assert.rejects(
        () => authMiddleware({ headers: { authorization: "Token inválido" } }, {}, () => {}),
        /Formato do token inválido/
    );
});

test("rejeita token assinado com outra chave", async () => {
    const token = jwt.sign({ id: "1", cargo: "admin", empresaId: "1" }, "outra-chave", {
        algorithm: "HS256",
    });

    await assert.rejects(
        () => authMiddleware({ headers: { authorization: `Bearer ${token}` } }, {}, () => {}),
        /Token inválido/
    );
});

test("rejeita usuário removido ou desativado mesmo com token válido", async () => {
    const token = generateToken({ _id: "usuario-1", cargo: "admin", empresaId: "empresa-1" });
    const find = mock.method(Usuario, "findOne", () => ({ select: async () => null }));
    try {
        await assert.rejects(
            () => authMiddleware({ headers: { authorization: `Bearer ${token}` } }, {}, () => {}),
            /Usuário desativado ou não encontrado/
        );
    } finally {
        find.mock.restore();
    }
});

test("perfil informa permissões atuais para o frontend", () => {
    const req = {
        usuario: {
            id: "usuario-1",
            empresaId: "empresa-1",
            nome: "Ana",
            email: "ana@exemplo.com",
            cargo: "caixa",
        },
    };
    const res = {
        status() {
            return this;
        },
        json(body) {
            return body.data;
        },
    };
    const perfil = me(req, res);
    assert.equal(perfil.cargo, "caixa");
    assert.deepEqual(perfil.permissoes, ["catalogo:ler"]);
});
