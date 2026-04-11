import express from "express";
import {
    criarProduto,
    listarProdutos,
    buscarProduto,
    atualizarProduto,
    deletarProduto
} from "../controllers/produtoController.js";

const router = express.Router();

router.post("/", criarProduto);
router.get("/", listarProdutos);
router.get("/:id", buscarProduto);
router.put("/:id", atualizarProduto);
router.delete("/:id", deletarProduto);

export default router;