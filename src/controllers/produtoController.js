import Produto from "../models/Produto.js";

// Criar produto
export const criarProduto = async (req, res) => {
    try {
        const { nome, preco, estoque } = req.body;

        if (!nome || !preco) {
            return res.status(400).json({ message: "Nome e preço são obrigatórios" });
        }

        const produto = await Produto.create({ nome, preco, estoque });

        res.status(201).json(produto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Listar todos
export const listarProdutos = async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar por ID
export const buscarProduto = async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);

        if (!produto) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.json(produto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar
export const atualizarProduto = async (req, res) => {
    try {
        const produto = await Produto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!produto) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.json(produto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Deletar
export const deletarProduto = async (req, res) => {
    try {
        const produto = await Produto.findByIdAndDelete(req.params.id);

        if (!produto) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};