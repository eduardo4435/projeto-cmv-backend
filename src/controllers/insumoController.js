import Insumo from "../models/Insumo.js";
import FichaTecnica from "../models/FichaTecnica.js";

// =======================
// CRIAR
// =======================
export const criarInsumo = async (req, res) => {
    try {
        const {
            nome,
            categoria,
            unidade,
            qtdBruta,
            qtdLiquida,
            valorTotal
        } = req.body;

        if (!nome || !categoria || !unidade || !qtdBruta || !qtdLiquida || !valorTotal) {
            return res.status(400).json({
                message: "Todos os campos são obrigatórios"
            });
        }

        if (qtdBruta <= 0 || qtdLiquida <= 0) {
            return res.status(400).json({
                message: "Quantidades inválidas"
            });
        }

        // ✅ cálculos
        const rendimento = Number((qtdLiquida / qtdBruta).toFixed(4));
        const rendimentoPercentual = Number((rendimento * 100).toFixed(2));
        const valorUnitario = Number((valorTotal / qtdLiquida).toFixed(2));

        const insumo = await Insumo.create({
            nome,
            categoria,
            unidade,
            qtdBruta,
            qtdLiquida,
            rendimento,
            rendimentoPercentual,
            valorTotal,
            valorUnitario
        });

        res.status(201).json(insumo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// =======================
// LISTAR
// =======================
export const listarInsumos = async (req, res) => {
    try {
        const insumos = await Insumo.find();

        const fichas = await FichaTecnica.find();

        const resultado = insumos.map(insumo => {

            // 🔹 contar processados filhos
            const quantidadeProcessados = insumos.filter(i =>
                i.origem?.insumoPai?.toString() === insumo._id.toString()
            ).length;

            // 🔹 contar uso em fichas
            const usadoEmFichas = fichas.filter(f =>
                f.ingredientes.some(ing =>
                    ing.insumo.toString() === insumo._id.toString()
                )
            ).length;

            // 🔹 nome do pai (se processado)
            const pai = insumos.find(i =>
                i._id.toString() === insumo.origem?.insumoPai?.toString()
            );

            return {
                ...insumo.toObject(),

                quantidadeProcessados,
                usadoEmFichas,
                insumoPaiNome: pai ? pai.nome : null
            };
        });

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =======================
// ATUALIZAR
// =======================
export const atualizarInsumo = async (req, res) => {
    try {
        const {
            nome,
            categoria,
            unidade,
            qtdBruta,
            qtdLiquida,
            valorTotal
        } = req.body;

        const rendimento = Number((qtdLiquida / qtdBruta).toFixed(4));
        const rendimentoPercentual = Number((rendimento * 100).toFixed(2));
        const valorUnitario = Number((valorTotal / qtdLiquida).toFixed(2));

        const insumo = await Insumo.findByIdAndUpdate(
            req.params.id,
            {
                nome,
                categoria,
                unidade,
                qtdBruta,
                qtdLiquida,
                rendimento,
                rendimentoPercentual,
                valorTotal,
                valorUnitario
            },
            { new: true }
        );

        if (!insumo) {
            return res.status(404).json({
                message: "Insumo não encontrado"
            });
        }

        // recalcular fichas
        const fichas = await FichaTecnica.find({
            "ingredientes.insumo": insumo._id
        });

        for (let ficha of fichas) {
            let novoCusto = 0;

            for (let item of ficha.ingredientes) {
                const insumoAtual = await Insumo.findById(item.insumo);

                if (insumoAtual) {
                    novoCusto += insumoAtual.valorUnitario * item.quantidade;
                }
            }

            ficha.custoTotal = Number(novoCusto.toFixed(2));
            await ficha.save();
        }

        res.json({
            message: "Atualizado com sucesso",
            insumo
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =======================
// DELETAR
// =======================
export const deletarInsumo = async (req, res) => {
    try {
        const existe = await FichaTecnica.exists({
            "ingredientes.insumo": req.params.id
        });

        if (existe) {
            return res.status(400).json({
                message: "Insumo está sendo usado em uma ficha"
            });
        }

        const insumo = await Insumo.findByIdAndDelete(req.params.id);

        if (!insumo) {
            return res.status(404).json({
                message: "Insumo não encontrado"
            });
        }

        res.json({ message: "Deletado com sucesso" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};