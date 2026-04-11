import express from "express";
import {
    criarFicha,
    listarFichas,
    buscarFicha,
    atualizarFicha,
    deletarFicha
} from "../controllers/fichaTecnicaController.js";

const router = express.Router();

router.post("/", criarFicha);
router.get("/", listarFichas);
router.get("/:id", buscarFicha);
router.put("/:id", atualizarFicha);
router.delete("/:id", deletarFicha);

export default router;