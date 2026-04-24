import Insumo from "../models/Insumo.js";
import FichaTecnica from "../models/FichaTecnica.js";
import Produto from "../models/Produto.js";

// =======================
// CONVERSÃO DE UNIDADE
// =======================
function converter(unidade, valor) {
    if (unidade === "ml" || unidade === "g") return valor / 1000;
    return valor;
}

// =======================
// CRIAR INSUMO
// =======================
export const criarInsumo = async (req, res) => {
    try {
        let {
            nome,
            categoria,
            unidade,
            qtdBruta,
            qtdLiquida,
            valorTotal,
            fornecedor
        } = req.body;

        if (!nome || !categoria || !unidade || !qtdBruta || !valorTotal) {
            return res.status(400).json({ message: "Campos obrigatórios faltando" });
        }

        if (qtdBruta <= 0 || valorTotal <= 0) {
            return res.status(400).json({ message: "Valores devem ser positivos" });
        }

        qtdBruta = converter(unidade, qtdBruta);
        qtdLiquida = qtdLiquida ? converter(unidade, qtdLiquida) : qtdBruta;

        if (qtdLiquida > qtdBruta) {
            return res.status(400).json({ message: "Qtd líquida não pode ser maior" });
        }

        const existe = await Insumo.findOne({ nome });
        if (existe) {
            return res.status(400).json({ message: "Nome já existe" });
        }

        const rendimento = qtdLiquida / qtdBruta;
        const valorUnitario = Number((valorTotal / qtdLiquida).toFixed(2));
        valorTotal = Number(valorTotal.toFixed(2));

        const insumo = await Insumo.create({
            nome,
            categoria,
            unidade,
            qtdBruta,
            qtdLiquida,
            rendimento,
            rendimentoPercentual: rendimento * 100,
            valorTotal,
            valorUnitario,
            fornecedor
        });

        res.status(201).json(insumo);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =======================
// CRIAR COM FICHA
// =======================
export const criarInsumoComFicha = async (req, res) => {
    try {
        let {
            nome,
            categoria,
            unidade,
            qtdBruta,
            qtdLiquida,
            valorTotal,
            fornecedor,
            precoVenda
        } = req.body;

        qtdBruta = converter(unidade, qtdBruta);
        qtdLiquida = qtdLiquida ? converter(unidade, qtdLiquida) : qtdBruta;

        const existe = await Insumo.findOne({ nome });
        if (existe) {
            return res.status(400).json({ message: "Nome já existe" });
        }

        const rendimento = qtdLiquida / qtdBruta;
        const valorUnitario = Number((valorTotal / qtdLiquida).toFixed(2));
        valorTotal = Number(valorTotal.toFixed(2));
        precoVenda = Number((precoVenda || valorUnitario).toFixed(2));

        const insumo = await Insumo.create({
            nome,
            categoria,
            unidade,
            qtdBruta,
            qtdLiquida,
            rendimento,
            rendimentoPercentual: rendimento * 100,
            valorTotal,
            valorUnitario,
            fornecedor
        });

        const produto = await Produto.create({
            nome,
            categoria,
            preco: precoVenda || valorUnitario
        });

        const ficha = await FichaTecnica.create({
            produto: produto._id,
            ingredientes: [
                {
                    insumo: insumo._id,
                    quantidade: 1
                }
            ],
            custoTotal: valorUnitario
        });

        res.status(201).json({ insumo, produto, ficha });

    } catch (error) {
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