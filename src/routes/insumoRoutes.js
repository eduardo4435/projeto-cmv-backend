import express from "express";
import {
    criarInsumo,
    listarInsumos,
    buscarInsumo,
    atualizarInsumo,
    deletarInsumo
} from "../controllers/insumoController.js";

const router = express.Router();

router.post("/", criarInsumo);
router.get("/", listarInsumos);
router.get("/:id", buscarInsumo);
router.put("/:id", atualizarInsumo);
router.delete("/:id", deletarInsumo);

export default router;