import test from "node:test";
import assert from "node:assert/strict";
import {
    criarMetadadosPaginacao,
    escaparRegex,
    obterOpcoesListagem,
} from "#shared/utils/paginacao.js";

test("mantém listagem sem paginação quando page e limit não são enviados", () => {
    assert.deepEqual(obterOpcoesListagem({ search: " arroz " }), {
        paginado: false,
        search: "arroz",
        categoria: "",
        tipo: "",
    });
});

test("calcula opções e deslocamento da paginação", () => {
    assert.deepEqual(obterOpcoesListagem({ page: "3", limit: "20" }), {
        paginado: true,
        page: 3,
        limit: 20,
        skip: 40,
        search: "",
        categoria: "",
        tipo: "",
    });
});

test("rejeita página e limite inválidos", () => {
    assert.throws(() => obterOpcoesListagem({ page: "0" }), /Página inválida/);
    assert.throws(() => obterOpcoesListagem({ limit: "101" }), /Limite deve estar entre 1 e 100/);
});

test("cria metadados de paginação", () => {
    assert.deepEqual(criarMetadadosPaginacao({ page: 2, limit: 20, total: 45 }), {
        page: 2,
        limit: 20,
        total: 45,
        totalPages: 3,
    });
});

test("escapa caracteres especiais de expressões regulares", () => {
    assert.equal(escaparRegex("arroz (1kg)+"), "arroz \\(1kg\\)\\+");
});
