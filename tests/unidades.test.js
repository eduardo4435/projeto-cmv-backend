import test from "node:test";
import assert from "node:assert/strict";
import {
    converterParaBase,
    converterParaExibicao,
    converterQuantidadeInsumoParaBase,
    converterQuantidadeInsumoParaExibicao,
    converterValorUnitarioParaExibicao,
    normalizarUnidade,
    obterUnidadeBase,
    obterUnidadeExibicao,
} from "#domain/estoque/unidades.js";

test("normaliza e mapeia unidades", () => {
    assert.equal(normalizarUnidade(" KG "), "kg");
    assert.equal(normalizarUnidade("L"), "l");
    assert.equal(obterUnidadeBase("kg"), "g");
    assert.equal(obterUnidadeBase("l"), "ml");
    assert.equal(obterUnidadeExibicao("g"), "kg");
    assert.equal(obterUnidadeExibicao("ml"), "l");
});

test("converte kg e litros para as unidades internas", () => {
    assert.equal(converterParaBase("kg", 1.5), 1500);
    assert.equal(converterParaBase("l", 0.5), 500);
    assert.equal(converterParaBase("g", 350), 350);
    assert.equal(converterParaBase("ml", 200), 200);
});

test("converte unidade com peso conhecido", () => {
    assert.equal(converterParaBase("un", 2, 350), 700);
    assert.throws(() => converterParaBase("un", 2), /Peso unitário inválido/);
});

test("converte quantidades internas para exibição", () => {
    assert.equal(converterParaExibicao("g", 1500), 1.5);
    assert.equal(converterParaExibicao("ml", 500), 0.5);
    assert.equal(converterParaExibicao("un", 3), 3);
});

test("cada ingrediente usa sua própria grandeza", () => {
    const arroz = { unidade: "g" };
    const agua = { unidade: "ml" };

    assert.equal(converterQuantidadeInsumoParaBase(1, arroz), 1000);
    assert.equal(converterQuantidadeInsumoParaBase(0.5, agua), 500);
});

test("unidade com conteúdo usa peso ou volume na ficha", () => {
    const lata = {
        unidade: "un",
        pesoUnitario: 350,
        unidadePesoUnitario: "ml",
    };

    assert.equal(converterQuantidadeInsumoParaBase(0.175, lata), 175);
    assert.equal(converterQuantidadeInsumoParaExibicao(175, lata), 0.175);
});

test("converte valor unitário interno para kg ou litro", () => {
    assert.equal(converterValorUnitarioParaExibicao(0.0038, "g"), 3.8);
    assert.equal(converterValorUnitarioParaExibicao(0.007143, "ml"), 7.143);
});

test("rejeita unidades e quantidades inválidas", () => {
    assert.throws(() => normalizarUnidade("caixa"), /Unidade inválida/);
    assert.throws(() => converterParaBase("kg", "abc"), /Quantidade inválida/);
});
