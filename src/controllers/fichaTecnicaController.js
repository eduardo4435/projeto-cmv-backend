import FichaTecnica from "../models/FichaTecnica.js";
import Insumo from "../models/Insumo.js";
import Produto from "../models/Produto.js";

// função auxiliar (reaproveita lógica)
const calcularCustoTotal = async (ingredientes) => {
    const insumos = await Insumo.find({
        _id: { $in: ingredientes.map(i => i.insumo) }
    });

    const mapa = {};
    insumos.forEach(i => {
        mapa[i._id] = i;
    });

    let custoTotal = 0;

    for (let item of ingredientes) {
        const insumo = mapa[item.insumo];

        if (!insumo) {
            throw new Error("Insumo não encontrado");
        }

        if (typeof item.quantidade !== "number" || item.quantidade <= 0) {
            throw new Error("Quantidade inválida");
        }

        const custoReal = insumo.custo / insumo.rendimento;

        custoTotal += custoReal * item.quantidade;
    }

    return Number(custoTotal.toFixed(2));
};

// validar ingredientes
const validarIngredientes = (ingredientes) => {
    if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
        return "Ingredientes inválidos";
    }

    const ids = ingredientes.map(i => i.insumo);
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);

    if (repetidos.length > 0) {
        return "Insumos duplicados na ficha";
    }

    return null;
};

// criar ficha
export const criarFicha = async (req, res) => {
    try {
        const { produto, ingredientes } = req.body;

        if (!produto || !Array.isArray(ingredientes) || ingredientes.length === 0) {
            return res.status(400).json({ message: "Dados inválidos" });
        }

        const erroIngredientes = validarIngredientes(ingredientes);
        if (erroIngredientes) {
            return res.status(400).json({ message: erroIngredientes });
        }

        const produtoExiste = await Produto.findById(produto);
        if (!produtoExiste) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        const custoTotal = await calcularCustoTotal(ingredientes);

        const ficha = await FichaTecnica.create({
            produto,
            ingredientes,
            custoTotal
        });

        res.status(201).json(ficha);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// listar fichas
export const listarFichas = async (req, res) => {
    try {
        const fichas = await FichaTecnica.find()
            .populate("produto")
            .populate("ingredientes.insumo");

        const resultado = fichas.map(ficha => {
        const preco = ficha.produto?.preco || 0;
        const custo = ficha.custoTotal;

        const lucro = preco - custo;
        const margem = preco > 0
            ? (lucro / preco) * 100
            : 0;

        // detalhamento dos ingredientes
        const ingredientesDetalhados = ficha.ingredientes.map(item => {
            const insumo = item.insumo;

            if (!insumo) return null;

            const custoReal = insumo.custo / insumo.rendimento;
            const custoItem = custoReal * item.quantidade;

            return {
                nome: insumo.nome,
                quantidade: item.quantidade,
                unidade: insumo.unidade,
                custoUnitario: insumo.custo,
                rendimento: insumo.rendimento,
                custoReal: Number(custoReal.toFixed(2)),
                custoItem: Number(custoItem.toFixed(2))
            };
        }).filter(i => i !== null);

        return {
            _id: ficha._id,
            produto: ficha.produto?.nome,
            precoVenda: preco,
            custoTotal: custo,
            lucro: Number(lucro.toFixed(2)),
            margem: Number(margem.toFixed(2)),
            ingredientes: ingredientesDetalhados
        };
    });

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// buscar ficha por id
export const buscarFicha = async (req, res) => {
    try {
        const ficha = await FichaTecnica.findById(req.params.id)
            .populate("produto")
            .populate("ingredientes.insumo");

        if (!ficha) {
            return res.status(404).json({ message: "Ficha não encontrada" });
        }

        const preco = ficha.produto?.preco || 0;
        const custo = ficha.custoTotal;

        const lucro = preco - custo;
        const margem = preco > 0
            ? (lucro / preco) * 100
            : 0;

        res.json({
            ...ficha.toObject(),
            lucro: Number(lucro.toFixed(2)),
            margem: Number(margem.toFixed(2))
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// atualizar ficha
export const atualizarFicha = async (req, res) => {
    try {
        const { produto, ingredientes } = req.body;

        if (!produto || !Array.isArray(ingredientes) || ingredientes.length === 0) {
            return res.status(400).json({ message: "Dados inválidos" });
        }

        const erroIngredientes = validarIngredientes(ingredientes);
        if (erroIngredientes) {
            return res.status(400).json({ message: erroIngredientes });
        }

        const produtoExiste = await Produto.findById(produto);
        if (!produtoExiste) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        const custoTotal = await calcularCustoTotal(ingredientes);

        const ficha = await FichaTecnica.findByIdAndUpdate(
            req.params.id,
            {
                produto,
                ingredientes,
                custoTotal
            },
            { returnDocument: "after" }
        );

        if (!ficha) {
            return res.status(404).json({ message: "Ficha não encontrada" });
        }

        res.json(ficha);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// deletar ficha
export const deletarFicha = async (req, res) => {
    try {
        const ficha = await FichaTecnica.findByIdAndDelete(req.params.id);

        if (!ficha) {
            return res.status(404).json({ message: "Ficha não encontrada" });
        }

        res.json({ message: "Ficha deletada com sucesso" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};