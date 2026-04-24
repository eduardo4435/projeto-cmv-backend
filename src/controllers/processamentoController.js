import Processamento from "../models/ProcessamentoInsumo.js";
import Insumo from "../models/Insumo.js";

export const criarProcessamento = async (req, res) => {
    try {
        const { insumoBaseId, insumoBase, porcionamentos } = req.body;

        let base;

        // 🔵 CENÁRIO 1: usar insumo base existente
        if (insumoBaseId) {
            base = await Insumo.findById(insumoBaseId);

            if (!base) {
                return res.status(404).json({
                    message: "Insumo base não encontrado"
                });
            }
        }

        // 🔵 CENÁRIO 2: criar insumo base na hora
        if (!insumoBaseId && insumoBase) {
            const {
                nome,
                categoria,
                unidade,
                qtdBruta,
                qtdLiquida,
                valorTotal,
                fornecedor
            } = insumoBase;

            if (!nome || !categoria || !unidade || !qtdBruta || !qtdLiquida || !valorTotal) {
                return res.status(400).json({
                    message: "Dados do insumo base obrigatórios"
                });
            }

            const rendimento = Number((qtdLiquida / qtdBruta).toFixed(4));
            const rendimentoPercentual = Number((rendimento * 100).toFixed(2));
            const valorUnitario = Number((valorTotal / qtdLiquida).toFixed(2));

            base = await Insumo.create({
                nome,
                categoria,
                unidade,
                qtdBruta,
                qtdLiquida,
                rendimento,
                rendimentoPercentual,
                valorTotal,
                valorUnitario,
                fornecedor
            });
        }

        if (!base) {
            return res.status(400).json({
                message: "Informe insumoBaseId ou insumoBase"
            });
        }

        // valida porcionamentos
        if (!Array.isArray(porcionamentos) || porcionamentos.length === 0) {
            return res.status(400).json({
                message: "Porcionamentos obrigatórios"
            });
        }

        let totalUsado = 0;
        const resultados = [];

        for (let item of porcionamentos) {
            const { nome, quantidadeUsada, pesoPorcao } = item;

            if (!nome || !quantidadeUsada || !pesoPorcao) {
                return res.status(400).json({
                    message: "Dados de porcionamento inválidos"
                });
            }

            const totalPorcoes = Math.floor(quantidadeUsada / pesoPorcao);
            const sobra = Number((quantidadeUsada % pesoPorcao).toFixed(3));

            totalUsado += quantidadeUsada;

            const valorPorPorcao = Number((base.valorUnitario * pesoPorcao).toFixed(2));

            const novoInsumo = await Insumo.create({
                nome,
                categoria: base.categoria,
                unidade: "porcao", // 🔥 aqui corrigido
                qtdBruta: quantidadeUsada,
                qtdLiquida: quantidadeUsada,
                rendimento: 1,
                rendimentoPercentual: 100,
                valorTotal: Number((base.valorUnitario * quantidadeUsada).toFixed(2)),
                valorUnitario: valorPorPorcao,
                tipo: "processado",
                origem: {
                    insumoPai: base._id,
                    quantidadeUsada
                }
            });

            resultados.push({
                nome,
                quantidadeUsada,
                pesoPorcao,
                totalPorcoes,
                sobra,
                insumoGerado: novoInsumo._id
            });
        }

        if (totalUsado > base.qtdLiquida) {
            return res.status(400).json({
                message: "Quantidade usada maior que o disponível"
            });
        }

        const processamento = await Processamento.create({
            insumoBase: base._id,
            fornecedor: base.fornecedor,
            qtdBruta: base.qtdBruta,
            qtdLiquida: base.qtdLiquida,
            rendimento: base.rendimento,
            valorTotal: base.valorTotal,
            valorUnitarioBase: base.valorUnitario,
            porcionamentos: resultados
        });

        res.status(201).json({
            message: "Processamento criado com sucesso",
            processamento
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};