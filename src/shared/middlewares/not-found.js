import { responderErro } from "#shared/http/resposta.js";

const notFound = (req, res) => {
    return responderErro(res, 404, "Rota não encontrada");
};

export default notFound;
