import express from "express";
import {
    criarInsumo,
    listarInsumos,
    atualizarInsumo,
    deletarInsumo,
    criarInsumoComFicha
} from "../controllers/insumoController.js";

const router = express.Router();

router.post("/", criarInsumo);
router.post("/com-ficha", criarInsumoComFicha);
router.get("/", listarInsumos);
router.put("/:id", atualizarInsumo);
router.delete("/:id", deletarInsumo);

export default router;