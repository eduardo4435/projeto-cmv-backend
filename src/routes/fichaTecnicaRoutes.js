import express from "express";
import {
    criarFicha,
    listarFichas,
    deletarFicha
} from "../controllers/fichaTecnicaController.js";

const router = express.Router();

router.post("/", criarFicha);
router.get("/", listarFichas);
router.delete("/:id", deletarFicha);

export default router;