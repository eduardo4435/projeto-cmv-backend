import mongoose from "mongoose";
import AppError from "../errors/AppError.js";

const validarObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("ID inválido", 400);
    }
};

export default validarObjectId;
