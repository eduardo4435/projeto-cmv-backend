import test, { mock } from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/teste";
process.env.JWT_SECRET = "chave-exclusiva-para-os-testes-automatizados-123";

const { temPermissao } = await import("#shared/auth/permissoes.js");
const { consultarFichasService } = await import("#modules/fichaTecnica/services/fichaTecnica.service.js");
const { default: FichaTecnica } = await import("#modules/fichaTecnica/models/fichaTecnica.model.js");
const { default: Usuario } = await import("#modules/usuarios/models/usuario.model.js");
const { default: Produto } = await import("#modules/produtos/models/produto.model.js");
const { listarProdutosService } = await import("#modules/produtos/services/produto.service.js");
const { generateToken } = await import("#shared/utils/generate-token.js");
const { default: app } = await import("../src/app.js");

test("cozinha consulta fichas sem receber permissões de custos ou edição", () => {
    assert.equal(temPermissao("cozinha", "fichas:consultar"), true);
    assert.equal(temPermissao("cozinha", "cmv:ler"), false);
    assert.equal(temPermissao("cozinha", "cmv:gerir"), false);
    assert.equal(temPermissao("cozinha", "catalogo:ler"), true);
    assert.equal(temPermissao("caixa", "fichas:consultar"), false);
    assert.equal(temPermissao("gerente", "fichas:consultar"), true);
});

test("rota da cozinha expõe apenas a consulta e nega CMV e edição", async () => {
    const logErro = mock.method(console, "error", () => {});
    const buscaUsuario = mock.method(Usuario, "findOne", (filtro) => ({
        select: async () => ({
            _id: filtro._id,
            empresaId: "empresa-1",
            cargo: filtro._id === "cozinha-1" ? "cozinha" : "caixa",
            ativo: true,
        }),
    }));
    const buscaFicha = mock.method(FichaTecnica, "find", () => ({
        select() { return this; },
        sort() { return this; },
        skip() { return this; },
        limit() { return this; },
        populate() { return this; },
        async lean() {
            return [{
                _id: "ficha-1",
                custoTotal: 999,
                produto: { nome: "Galeto", categoria: "Pratos", preco: 999 },
                ingredientes: [{ insumo: { nome: "Frango", unidade: "g", valorUnitario: 999 }, quantidade: 250 }],
            }];
        },
    }));
    const contar = mock.method(FichaTecnica, "countDocuments", async () => 1);
    const buscaFichaUnica = mock.method(FichaTecnica, "findOne", (filtro) => {
        assert.equal(filtro.empresaId, "empresa-1");
        return {
            select() { return this; },
            populate() { return this; },
            async lean() {
                return {
                    _id: "ficha-1",
                    produto: { nome: "Galeto", categoria: "Pratos", preco: 999 },
                    custoTotal: 999,
                    ingredientes: [{ insumo: { nome: "Frango", unidade: "g", valorUnitario: 999 }, quantidade: 250 }],
                };
            },
        };
    });
    const server = await new Promise((resolve) => {
        const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
    });
    try {
        const base = `http://127.0.0.1:${server.address().port}`;
        const requisitar = (id, caminho, opcoes = {}) => fetch(`${base}${caminho}`, {
            ...opcoes,
            headers: {
                Authorization: `Bearer ${generateToken({ _id: id, cargo: "funcionario", empresaId: "empresa-1" })}`,
                ...(opcoes.headers || {}),
            },
        });
        const consulta = await requisitar("cozinha-1", "/fichas/consulta?page=1&limit=20");
        assert.equal(consulta.status, 200);
        const resposta = await consulta.json();
        assert.deepEqual(resposta.data[0].ingredientes, [{ nome: "Frango", quantidade: 0.25, unidade: "kg" }]);
        assert.equal(JSON.stringify(resposta).includes("999"), false);
        const detalhe = await requisitar("cozinha-1", "/fichas/consulta/produto/507f1f77bcf86cd799439011");
        assert.equal(detalhe.status, 200);
        assert.deepEqual((await detalhe.json()).data.ingredientes, [{ nome: "Frango", quantidade: 0.25, unidade: "kg" }]);
        assert.equal((await requisitar("cozinha-1", "/fichas")).status, 403);
        assert.equal((await requisitar("cozinha-1", "/fichas", { method: "POST" })).status, 403);
        assert.equal((await requisitar("caixa-1", "/fichas/consulta")).status, 403);
        assert.equal((await requisitar("caixa-1", "/fichas/consulta/produto/507f1f77bcf86cd799439011")).status, 403);
    } finally {
        logErro.mock.restore();
        buscaUsuario.mock.restore();
        buscaFicha.mock.restore();
        buscaFichaUnica.mock.restore();
        contar.mock.restore();
        await new Promise((resolve) => server.close(resolve));
    }
});

test("listagem operacional de produtos não consulta nem devolve custos", async () => {
    const buscaProduto = mock.method(Produto, "find", () => ({
        async lean() {
            return [{
                _id: "produto-1", nome: "Galeto", categoria: "Pratos", preco: 120,
                empresaId: "empresa-1", custo: 999,
            }];
        },
    }));
    const buscaCustos = mock.method(FichaTecnica, "find", () => {
        throw new Error("Consulta de custos não deveria ser executada");
    });
    try {
        const resposta = await listarProdutosService("empresa-1", { paginado: false }, false);
        assert.deepEqual(resposta.data, [{
            _id: "produto-1", nome: "Galeto", categoria: "Pratos", preco: 120,
        }]);
        assert.equal(buscaCustos.mock.callCount(), 0);
    } finally {
        buscaProduto.mock.restore();
        buscaCustos.mock.restore();
    }
});

test("consulta retorna apenas receita e quantidades e filtra por empresa", async () => {
    let filtroUsado;
    const fichas = mock.method(FichaTecnica, "find", (filtro) => {
        filtroUsado = filtro;
        const consulta = {
            select() { return this; },
            sort() { return this; },
            skip() { return this; },
            limit() { return this; },
            populate() { return this; },
            async lean() {
                return [{
                    _id: "ficha-1",
                    custoTotal: 90,
                    produto: { nome: "Galeto", categoria: "Pratos", preco: 120 },
                    ingredientes: [{
                        quantidade: 350,
                        insumo: { nome: "Frango", unidade: "g", valorUnitario: 0.5, fornecedor: "Segredo" },
                    }],
                }];
            },
        };
        return consulta;
    });
    const contar = mock.method(FichaTecnica, "countDocuments", async () => 1);
    try {
        const resposta = await consultarFichasService("empresa-1", {
            paginado: true, page: 1, limit: 20, skip: 0,
        });
        assert.deepEqual(filtroUsado, { empresaId: "empresa-1" });
        assert.deepEqual(resposta.data, [{
            _id: "ficha-1",
            produto: "Galeto",
            categoria: "Pratos",
            ingredientes: [{ nome: "Frango", quantidade: 0.35, unidade: "kg" }],
        }]);
        assert.equal(resposta.pagination.total, 1);
        assert.equal(JSON.stringify(resposta).includes("Segredo"), false);
        assert.equal(JSON.stringify(resposta).includes("custoTotal"), false);
    } finally {
        fichas.mock.restore();
        contar.mock.restore();
    }
});
