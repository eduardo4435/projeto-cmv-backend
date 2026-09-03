import "dotenv/config";

import XLSX from "xlsx";

import { connectDB, disconnectDB } from "../config/database.js";
import { env } from "../config/env.js";
import Insumo from "../modules/insumos/models/insumo.model.js";
import { converterUnidade } from "../domain/estoque/converter-unidade.js";

const EMPRESA_ID = "6a7b86c15ab93e5396586bc3";

function normalizarUnidade(unidade) {
    unidade = String(unidade || "").trim();

    const mapa = {
        Kg: "kg",
        KG: "kg",
        kg: "kg",

        Gr: "g",
        GR: "g",
        g: "g",

        Ml: "ml",
        ML: "ml",
        ml: "ml",

        Lt: "l",
        LT: "l",
        l: "l",

        Unid: "un",
        UNID: "un",
        un: "un",
    };

    return mapa[unidade] || "un";
}

async function importar() {
    try {
        await connectDB(env.mongoUri);

        const workbook = XLSX.readFile("./insumos.xlsx");

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet, {
            range: 1,
        });

        let sucesso = 0;
        let erros = 0;

        for (const row of rows) {
            try {
                const nome = row["DESCRIÇÃO"]?.trim();

                if (!nome) continue;

                const unidade = normalizarUnidade(row["UNID"]);

                let qtdBruta = Number(row["QT BRUTA"]);

                let qtdLiquida = Number(row["QT LIQUIDA"]);

                const valorTotal = Number(row["VALOR"]);

                if (!qtdBruta || !qtdLiquida || !valorTotal) {
                    console.log(`Ignorado: ${nome}`);
                    continue;
                }

                qtdBruta = converterUnidade(unidade, qtdBruta);
                qtdLiquida = converterUnidade(unidade, qtdLiquida);

                const rendimento = qtdLiquida / qtdBruta;

                const valorUnitario = Number((valorTotal / qtdLiquida).toFixed(6));

                await Insumo.create({
                    empresaId: EMPRESA_ID,

                    nome,

                    categoria: row["CATEGORIA"],

                    unidade,

                    fornecedor: "",

                    qtdBruta,
                    qtdLiquida,

                    rendimento,

                    rendimentoPercentual: rendimento * 100,

                    valorTotal,

                    valorUnitario,
                });

                sucesso++;

                console.log(`✔ ${nome}`);
            } catch (err) {
                erros++;

                console.log(`✖ ${row["DESCRIÇÃO"]}`);

                console.log(err.message);
            }
        }

        console.log("");
        console.log("==============");
        console.log(`Sucesso: ${sucesso}`);
        console.log(`Erros: ${erros}`);
        console.log("==============");

        await disconnectDB();
    } catch (err) {
        console.error("Erro geral:", err);

        await disconnectDB();
    }
}

importar();
