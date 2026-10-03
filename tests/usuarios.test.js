import test, { mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/teste";
process.env.JWT_SECRET = "chave-exclusiva-para-os-testes-automatizados-123";

const { cargos, temPermissao } = await import("#shared/auth/permissoes.js");
const { default: authorize } = await import("#shared/middlewares/authorize.middleware.js");
const { default: Usuario } = await import("#modules/usuarios/models/usuario.model.js");
const { default: Empresa } = await import("#modules/empresa/models/empresa.model.js");
const { criarUsuario, atualizarUsuario, deletarUsuario } =
    await import("#modules/usuarios/services/usuario.service.js");
const { register } = await import("#modules/auth/services/auth.service.js");
const { generateToken } = await import("#shared/utils/generate-token.js");
const { default: app } = await import("../src/app.js");
const { validarCriarUsuario } = await import("#modules/usuarios/validators/usuario.validator.js");
const { validarRegister, validarLogin } = await import("#modules/auth/validators/auth.validator.js");
const { listarCargosController } =
    await import("#modules/usuarios/controllers/usuario.controller.js");

const admin = { id: "dono-1", cargo: "admin" };
const gerente = { id: "gerente-1", cargo: "gerente" };

function usuario(id, cargo, ativo = true) {
    return { _id: id, empresaId: "empresa-1", cargo, ativo, save: async () => {} };
}

test("cargos de operação não acessam custos; gerente pode gerir CMV", () => {
    assert.deepEqual(cargos, ["admin", "gerente", "caixa", "garcom", "cozinha", "funcionario"]);
    assert.equal(temPermissao("gerente", "cmv:gerir"), true);
    assert.equal(temPermissao("caixa", "catalogo:ler"), true);
    assert.equal(temPermissao("garcom", "cmv:ler"), false);
    assert.equal(temPermissao("funcionario", "cmv:ler"), true);
    assert.throws(
        () => authorize("cmv:ler")({ usuario: { cargo: "garcom" } }, {}, () => {}),
        /Acesso negado/
    );
});

test("criação de funcionário exige cargo explícito e não permite admin", () => {
    const dados = { nome: "Ana", email: "ana@exemplo.com", senha: "1234" };
    assert.throws(() => validarCriarUsuario({ body: dados }, {}, () => {}), /Escolha um cargo/);
    assert.throws(
        () => validarCriarUsuario({ body: { ...dados, cargo: "admin" } }, {}, () => {}),
        /Escolha um cargo/
    );
    assert.throws(
        () => validarCriarUsuario({ body: { ...dados, cargo: "funcionario" } }, {}, () => {}),
        /Escolha um cargo/
    );
    let validou = false;
    validarCriarUsuario({ body: { ...dados, cargo: "garcom" } }, {}, () => {
        validou = true;
    });
    assert.equal(validou, true);
});

test("senha numérica começa em quatro dígitos, preserva zeros e recusa letras", async () => {
    const usuario = { nome: "Ana", email: "ana@exemplo.com", cargo: "garcom" };
    for (const senha of ["123", "12a4", 1234, " 1234"]) {
        assert.throws(() => validarCriarUsuario({ body: { ...usuario, senha } }, {}, () => {}), /Senha deve conter somente números/);
        await assert.rejects(() => validarRegister({ body: { ...usuario, empresa: "Nova", cnpj: "123", senha } }, {}, () => {}), /Senha deve conter somente números/);
    }
    for (const senha of ["0000", "12345"]) {
        let validou = false;
        validarCriarUsuario({ body: { ...usuario, senha } }, {}, () => { validou = true; });
        assert.equal(validou, true);
        validou = false;
        validarLogin({ body: { email: usuario.email, senha } }, {}, () => { validou = true; });
        assert.equal(validou, true);
    }
    assert.throws(() => validarLogin({ body: { email: usuario.email, senha: "abc4" } }, {}, () => {}), /Senha deve conter somente números/);
});

test("lista de cargos respeita quem está cadastrando", () => {
    const response = () => ({
        status() {
            return this;
        },
        json(body) {
            return body.data;
        },
    });
    assert.deepEqual(listarCargosController({ usuario: admin }, response()), [
        "gerente",
        "caixa",
        "garcom",
        "cozinha",
    ]);
    assert.deepEqual(listarCargosController({ usuario: gerente }, response()), [
        "caixa",
        "garcom",
        "cozinha",
    ]);
});

test("gerente não pode criar outro gerente nem assumir conta privilegiada", async () => {
    await assert.rejects(
        () => criarUsuario({ cargo: "gerente" }, "empresa-1", gerente),
        /Gerente só pode gerir funcionários/
    );
    const find = mock.method(Usuario, "findOne", async () => usuario("dono-1", "admin"));
    try {
        await assert.rejects(
            () => atualizarUsuario("dono-1", { nome: "Outro" }, "empresa-1", gerente),
            /Gerente só pode gerir funcionários/
        );
    } finally {
        find.mock.restore();
    }
});

test("nem o serviço cria outro administrador por uma rota de funcionário", async () => {
    await assert.rejects(
        () => criarUsuario({ cargo: "admin" }, "empresa-1", admin),
        /cargo informado não pode ser atribuído/
    );
});

test("desativar funcionário preserva o registro e protege o administrador", async () => {
    let salvo = false;
    const alvo = usuario("caixa-1", "caixa");
    alvo.save = async () => {
        salvo = true;
    };
    const find = mock.method(Usuario, "findOne", async () => alvo);
    try {
        await deletarUsuario("caixa-1", "empresa-1", admin);
        assert.equal(alvo.ativo, false);
        assert.equal(salvo, true);
        await atualizarUsuario("caixa-1", { ativo: true }, "empresa-1", admin);
        assert.equal(alvo.ativo, true);
        alvo.cargo = "admin";
        await assert.rejects(
            () => deletarUsuario("caixa-1", "empresa-1", admin),
            /administrador responsável/
        );
    } finally {
        find.mock.restore();
    }
});

test("cadastro público rejeita CNPJ de empresa existente antes de criar usuário", async () => {
    let criou = false;
    const session = mock.method(mongoose, "startSession", async () => ({
        withTransaction: async (callback) => callback(),
        endSession: async () => {},
    }));
    const find = mock.method(Empresa, "findOne", () => ({
        session: async () => ({ _id: "empresa-1" }),
    }));
    const create = mock.method(Usuario, "create", async () => {
        criou = true;
    });
    try {
        await assert.rejects(
            () =>
                register({
                    nome: "Ana",
                    email: "ana@exemplo.com",
                    senha: "senha-segura",
                    empresa: "Existente",
                    cnpj: "123",
                }),
            /Empresa já cadastrada/
        );
        assert.equal(criou, false);
    } finally {
        session.mock.restore();
        find.mock.restore();
        create.mock.restore();
    }
});

test("empresa nova recebe apenas seu primeiro administrador", async () => {
    const session = mock.method(mongoose, "startSession", async () => ({
        withTransaction: async (callback) => callback(),
        endSession: async () => {},
    }));
    const find = mock.method(Empresa, "findOne", () => ({ session: async () => null }));
    const empresa = mock.method(Empresa, "create", async () => [
        { _id: "empresa-1", nome: "Nova" },
    ]);
    const usuario = mock.method(Usuario, "create", async (dados) => [
        {
            _id: "dono-1",
            nome: dados[0].nome,
            email: dados[0].email,
            cargo: dados[0].cargo,
            ativo: true,
            empresaId: "empresa-1",
        },
    ]);
    try {
        const resultado = await register({
            nome: "Ana",
            email: "ana@exemplo.com",
            senha: "senha-segura",
            empresa: "Nova",
            cnpj: "123",
        });
        assert.equal(resultado.usuario.cargo, "admin");
        assert.equal(resultado.usuario.empresa.id, "empresa-1");
        assert.equal(resultado.usuario.permissoes.includes("usuarios:gerir"), true);
    } finally {
        session.mock.restore();
        find.mock.restore();
        empresa.mock.restore();
        usuario.mock.restore();
    }
});

test("rotas expõem cargos ao gerente e não revelam custos ao garçom", async () => {
    const logged = mock.method(console, "error", () => {});
    const find = mock.method(Usuario, "findOne", (query) => ({
        select: async () => usuario(query._id, query._id === "garcom-1" ? "garcom" : "gerente"),
    }));
    const server = await new Promise((resolve) => {
        const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
    });
    try {
        const base = `http://127.0.0.1:${server.address().port}`;
        const token = (id) =>
            generateToken({ _id: id, empresaId: "empresa-1", cargo: "funcionario" });
        const cargosResponse = await fetch(`${base}/usuarios/cargos`, {
            headers: { Authorization: `Bearer ${token("gerente-1")}` },
        });
        assert.equal(cargosResponse.status, 200);
        assert.deepEqual((await cargosResponse.json()).data, ["caixa", "garcom", "cozinha"]);
        const custosResponse = await fetch(`${base}/insumos`, {
            headers: { Authorization: `Bearer ${token("garcom-1")}` },
        });
        assert.equal(custosResponse.status, 403);
    } finally {
        logged.mock.restore();
        find.mock.restore();
        await new Promise((resolve) => server.close(resolve));
    }
});
