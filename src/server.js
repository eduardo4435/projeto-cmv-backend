import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/database.js";

connectDB();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

