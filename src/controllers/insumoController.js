import Insumo from "../models/Insumo.js";
import FichaTecnica from "../models/FichaTecnica.js";

// Criar
export const criarInsumo = async (req, res) => {
    try {
        const { nome, unidade, custo } = req.body;

        if (custo == null || typeof custo !== "number") {
            return res.status(400).json({
                message: "Custo inválido"
            });
        }

        if (!nome || !unidade || !custo) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        const insumo = await Insumo.create({ nome, unidade, custo });

        res.status(201).json(insumo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Listar
export const listarInsumos = async (req, res) => {
    try {
        const insumos = await Insumo.find();
        res.json(insumos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar por ID
export const buscarInsumo = async (req, res) => {
    try {
        const insumo = await Insumo.findById(req.params.id);

        if (!insumo) {
            return res.status(404).json({ message: "Insumo não encontrado" });
        }

        res.json(insumo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar
export const atualizarInsumo = async (req, res) => {
    try {
        const { nome, unidade, custo } = req.body;

        const insumo = await Insumo.findByIdAndUpdate(
            req.params.id,
            { nome, unidade, custo },
            { new: true }
        );

        if (!insumo) {
            return res.status(404).json({ message: "Insumo não encontrado" });
        }

        // REPROCESSAR FICHAS QUE USAM ESSE INSUMO
        const fichas = await FichaTecnica.find({
            "ingredientes.insumo": insumo._id
        });

        for (let ficha of fichas) {
            let novoCusto = 0;

            for (let item of ficha.ingredientes) {
                const insumoAtual = await Insumo.findById(item.insumo);

                if (insumoAtual) {
                    novoCusto += insumoAtual.custo * item.quantidade;
                }
            }

            ficha.custoTotal = Number(novoCusto.toFixed(2));
            await ficha.save();
        }

        res.json({
            message: "Insumo atualizado e fichas recalculadas",
            insumo
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Deletar
export const deletarInsumo = async (req, res) => {
    try {
        const existe = await FichaTecnica.findOne({
            "ingredientes.insumo": req.params.id
        });

        if (existe) {
            return res.status(400).json({
                message: "Insumo está sendo usado em uma ficha técnica"
            });
        }

        const insumo = await Insumo.findByIdAndDelete(req.params.id);

        if (!insumo) {
            return res.status(404).json({ message: "Insumo não encontrado" });
        }

        res.json({ message: "Insumo deletado com sucesso" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};