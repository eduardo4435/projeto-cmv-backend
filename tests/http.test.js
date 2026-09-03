import test from "node:test";
import assert from "node:assert/strict";
import asyncHandler from "#shared/middlewares/async-handler.js";
import { responderErro, responderSucesso } from "#shared/http/resposta.js";

function criarRespostaMock() {
    return {
        statusCode: null,
        body: null,
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

test("padroniza resposta de sucesso", () => {
    const res = criarRespostaMock();

    responderSucesso(res, {
        statusCode: 201,
        data: { id: "1" },
    });

    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.body, {
        success: true,
        data: { id: "1" },
    });
});

test("inclui paginação somente quando informada", () => {
    const res = criarRespostaMock();

    responderSucesso(res, { data: [], pagination: undefined });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true, data: [] });
});

test("padroniza resposta de erro", () => {
    const res = criarRespostaMock();

    responderErro(res, 404, "Não encontrado");

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
        success: false,
        message: "Não encontrado",
    });
});

test("asyncHandler encaminha rejeições ao middleware de erro", async () => {
    const erro = new Error("Falha esperada");

    await new Promise((resolve, reject) => {
        const handler = asyncHandler(async () => {
            throw erro;
        });

        handler({}, {}, (erroRecebido) => {
            try {
                assert.equal(erroRecebido, erro);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
});
