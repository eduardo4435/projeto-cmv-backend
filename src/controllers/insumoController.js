import Insumo from "../models/Insumo.js";
import FichaTecnica from "../models/FichaTecnica.js";

// criar insumo
export const criarInsumo = async (req, res) => {
    try {
        const { nome, unidade, custo, rendimento } = req.body;

        if (!nome || !unidade || custo == null) {
            return res.status(400).json({
                message: "Nome, unidade e custo são obrigatórios"
            });
        }

        if (typeof custo !== "number") {
            return res.status(400).json({
                message: "Custo inválido"
            });
        }

        const insumo = await Insumo.create({
            nome,
            unidade,
            custo,
            rendimento: rendimento ?? 1
        });

        res.status(201).json(insumo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// listar insumo
export const listarInsumos = async (req, res) => {
    try {
        const insumos = await Insumo.find();
        res.json(insumos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// buscar insumo
export const buscarInsumo = async (req, res) => {
    try {
        const insumo = await Insumo.findById(req.params.id);

        if (!insumo) {
            return res.status(404).json({
                message: "Insumo não encontrado"
            });
        }

        res.json(insumo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// update insumo
export const atualizarInsumo = async (req, res) => {
    try {
        const { nome, unidade, custo, rendimento } = req.body;

        const insumo = await Insumo.findByIdAndUpdate(
            req.params.id,
            {
                nome,
                unidade,
                custo,
                rendimento: rendimento ?? 1
            },
            { new: true }
        );

        if (!insumo) {
            return res.status(404).json({
                message: "Insumo não encontrado"
            });
        }

        // processar ficha
        const fichas = await FichaTecnica.find({
            "ingredientes.insumo": insumo._id
        });

        for (let ficha of fichas) {
            let novoCusto = 0;

            for (let item of ficha.ingredientes) {
                const insumoAtual = await Insumo.findById(item.insumo);

                if (insumoAtual) {
                    const custoReal =
                        insumoAtual.custo / (insumoAtual.rendimento || 1);

                    novoCusto += custoReal * item.quantidade;
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
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// deletar insumo
export const deletarInsumo = async (req, res) => {
    try {
        console.log("Tentando deletar:", req.params.id);

        const existe = await FichaTecnica.exists({
            "ingredientes.insumo": req.params.id
        });

        console.log("Existe ficha usando?", existe);

        if (existe) {
            return res.status(400).json({
                message: "Insumo está sendo usado em uma ficha técnica"
            });
        }

        const insumo = await Insumo.findByIdAndDelete(req.params.id);

        console.log("Resultado delete:", insumo);

        if (!insumo) {
            return res.status(404).json({
                message: "Insumo não encontrado"
            });
        }

        res.json({
            message: "Insumo deletado com sucesso"
        });

    } catch (error) {
        console.error("ERRO REAL:", error);
        res.status(500).json({ error: error.message });
    }
};