import Produto from "../models/Produto.js";
import FichaTecnica from "../models/FichaTecnica.js";

// funcao auxiliar
const definirTipoPorCategoria = (categoria) => {
    const categoriasBebidas = [
        "soft drinks",
        "cervejas 600ml",
        "drinks",
        "destilados garrafa",
        "destilados doses",
        "chopp"
    ];

    return categoriasBebidas.includes(categoria)
        ? "bebida"
        : "comida";
};

// criar produto
export const criarProduto = async (req, res) => {
    try {
        const { nome, preco, estoque, categoria } = req.body;

        if (!nome || preco == null) {
            return res.status(400).json({
                message: "Nome e preço são obrigatórios"
            });
        }

        const tipo = definirTipoPorCategoria(categoria);

        const produto = await Produto.create({
            nome,
            preco,
            estoque,
            tipo,
            categoria
        });

        res.status(201).json(produto);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// listar produtos
export const listarProdutos = async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// buscar por id
export const buscarProduto = async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);

        if (!produto) {
            return res.status(404).json({
                message: "Produto não encontrado"
            });
        }

        res.json(produto);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// update produto
export const atualizarProduto = async (req, res) => {
    try {
        const { categoria } = req.body;

        // se mudar categoria, recalcula tipo
        if (categoria) {
            req.body.tipo = definirTipoPorCategoria(categoria);
        }

        const produto = await Produto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!produto) {
            return res.status(404).json({
                message: "Produto não encontrado"
            });
        }

        res.json(produto);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// deletar produto
export const deletarProduto = async (req, res) => {
    try {
        // verifica se esta em ficha
        const existe = await FichaTecnica.exists({
            produto: req.params.id
        });

        if (existe) {
            return res.status(400).json({
                message: "Produto está sendo usado em uma ficha técnica"
            });
        }

        const produto = await Produto.findByIdAndDelete(req.params.id);

        if (!produto) {
            return res.status(404).json({
                message: "Produto não encontrado"
            });
        }

        res.json({
            message: "Produto deletado com sucesso"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};