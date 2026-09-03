import test from "node:test";
import assert from "node:assert/strict";
import { calcularMetricas } from "#domain/custos/calcular-metricas.js";
import {
    calcularIndicadores,
    converterQuantidades,
    normalizarDadosInsumo,
    obterQuantidadeInicialFicha,
} from "#modules/insumos/services/insumo.helpers.js";
import { round } from "#shared/utils/round-number.js";

test("calcula lucro, CMV e margem", () => {
    assert.deepEqual(calcularMetricas(25, 7.8), {
        lucro: 17.2,
        cmv: 31.2,
        margem: 68.8,
    });
});

test("evita divisão por zero nas métricas", () => {
    assert.deepEqual(calcularMetricas(0, 10), {
        lucro: -10,
        cmv: 0,
        margem: 0,
    });
});

test("calcula rendimento e custo unitário pelo líquido", () => {
    assert.deepEqual(calcularIndicadores(10000, 8000, 50), {
        rendimento: 0.8,
        rendimentoPercentual: 80,
        valorUnitario: 0.00625,
    });
});

test("converte quantidades bruta e líquida", () => {
    assert.deepEqual(converterQuantidades("kg", 10, 8, null), {
        unidade: "g",
        qtdBruta: 10000,
        qtdLiquida: 8000,
    });
});

test("usa quantidade bruta quando a líquida não é informada", () => {
    assert.deepEqual(converterQuantidades("l", 2, null, null), {
        unidade: "ml",
        qtdBruta: 2000,
        qtdLiquida: 2000,
    });
});

test("normaliza números recebidos como texto", () => {
    assert.deepEqual(
        normalizarDadosInsumo({
            unidade: "kg",
            qtdBruta: "10",
            qtdLiquida: "8",
            valorTotal: "50",
        }),
        {
            unidade: "kg",
            qtdBruta: 10,
            qtdLiquida: 8,
            valorTotal: 50,
            pesoUnitario: null,
            unidadePesoUnitario: null,
        }
    );
});

test("define quantidade inicial de fichas automáticas", () => {
    assert.equal(obterQuantidadeInicialFicha({ unidade: "g" }), 1000);
    assert.equal(obterQuantidadeInicialFicha({ unidade: "ml" }), 1000);
    assert.equal(obterQuantidadeInicialFicha({ unidade: "un", pesoUnitario: 350 }), 350);
    assert.equal(obterQuantidadeInicialFicha({ unidade: "un" }), 1);
});

test("arredonda valores monetários", () => {
    assert.equal(round(10.126), 10.13);
    assert.equal(round(0.006251, 6), 0.006251);
});
