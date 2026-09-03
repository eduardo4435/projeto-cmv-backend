import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/teste";
process.env.JWT_SECRET = "chave-exclusiva-para-os-testes-automatizados-123";

const { env } = await import("../src/config/env.js");
const { generateToken } = await import("#shared/utils/generate-token.js");
const { default: authMiddleware } = await import("#shared/middlewares/auth.middleware.js");

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

test("aceita Authorization Bearer válido", () => {
    const token = generateToken({
        _id: "usuario-1",
        cargo: "funcionario",
        empresaId: "empresa-1",
    });
    const req = {
        headers: { authorization: `Bearer ${token}` },
    };
    let chamouNext = false;

    authMiddleware(req, {}, () => {
        chamouNext = true;
    });

    assert.equal(chamouNext, true);
    assert.equal(req.usuario.empresaId, "empresa-1");
});

test("rejeita token ausente ou fora do padrão Bearer", () => {
    assert.throws(() => authMiddleware({ headers: {} }, {}, () => {}), /Token não informado/);
    assert.throws(
        () => authMiddleware({ headers: { authorization: "Token inválido" } }, {}, () => {}),
        /Formato do token inválido/
    );
});

test("rejeita token assinado com outra chave", () => {
    const token = jwt.sign({ id: "1", cargo: "admin", empresaId: "1" }, "outra-chave", {
        algorithm: "HS256",
    });

    assert.throws(
        () => authMiddleware({ headers: { authorization: `Bearer ${token}` } }, {}, () => {}),
        /Token inválido/
    );
});
