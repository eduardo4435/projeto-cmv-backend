import FichaTecnica from "../models/FichaTecnica.js";
import Insumo from "../models/Insumo.js";
import Produto from "../models/Produto.js";

// =======================
// CALCULAR CUSTO
// =======================
const calcularCustoTotal = async (ingredientes) => {
    const insumos = await Insumo.find({
        _id: { $in: ingredientes.map(i => i.insumo) }
    });

    const mapa = {};
    insumos.forEach(i => {
        mapa[i._id] = i;
    });

    let total = 0;

    for (let item of ingredientes) {
        const insumo = mapa[item.insumo];

        if (!insumo) {
            throw new Error("Insumo não encontrado");
        }

        total += insumo.valorUnitario * item.quantidade;
    }

    return Number(total.toFixed(2));
};

// =======================
// CRIAR FICHA + PRODUTO
// =======================
export const criarFicha = async (req, res) => {
    try {
        const { nomeProduto, categoria, ingredientes, precoVenda } = req.body;

        if (!nomeProduto || !categoria || !ingredientes?.length) {
            return res.status(400).json({
                message: "Dados inválidos"
            });
        }

        // calcular custo
        const custoTotal = await calcularCustoTotal(ingredientes);

        // criar produto automaticamente
        const produto = await Produto.create({
            nome: nomeProduto,
            categoria,
            preco: precoVenda || 0
        });

        // calcular CMV
        const preco = precoVenda || 0;
        const cmv = preco > 0 ? (custoTotal / preco) * 100 : 0;

        // criar ficha
        const ficha = await FichaTecnica.create({
            produto: produto._id,
            ingredientes,
            custoTotal
        });

        res.status(201).json({
            message: "Ficha criada com sucesso",
            produto,
            ficha,
            custoTotal,
            cmv: Number(cmv.toFixed(2))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// =======================
// LISTAR FICHAS
// =======================
export const listarFichas = async (req, res) => {
    try {
        const fichas = await FichaTecnica.find()
            .populate("produto")
            .populate("ingredientes.insumo");

        const resultado = fichas.map(f => {
            const preco = f.produto?.preco || 0;
            const custo = f.custoTotal;

            const lucro = preco - custo;
            const cmv = preco > 0 ? (custo / preco) * 100 : 0;

            return {
                _id: f._id,
                produto: f.produto?.nome,
                categoria: f.produto?.categoria,
                precoVenda: preco,
                custoTotal: custo,
                lucro: Number(lucro.toFixed(2)),
                cmv: Number(cmv.toFixed(2)),

                ingredientes: f.ingredientes.map(i => ({
                    nome: i.insumo?.nome,
                    quantidade: i.quantidade,
                    unidade: i.insumo?.unidade
                }))
            };
        });

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =======================
// DELETAR FICHA + PRODUTO
// =======================
export const deletarFicha = async (req, res) => {
    try {
        const ficha = await FichaTecnica.findById(req.params.id);

        if (!ficha) {
            return res.status(404).json({
                message: "Ficha não encontrada"
            });
        }

        // deletar produto junto
        await Produto.findByIdAndDelete(ficha.produto);

        await ficha.deleteOne();

        res.json({
            message: "Ficha e produto deletados"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};