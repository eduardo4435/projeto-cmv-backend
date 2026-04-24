import express from "express";
import { criarProcessamento } from "../controllers/processamentoController.js";

const router = express.Router();

router.post("/", criarProcessamento);

export default router;