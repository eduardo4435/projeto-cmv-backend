import Insumo from "../models/insumo.model.js";
import FichaTecnica from "../../fichaTecnica/models/fichaTecnica.model.js";
import { mapInsumo } from "#shared/mappers/insumo.mapper.js";
import { criarMetadadosPaginacao, escaparRegex } from "#shared/utils/paginacao.js";

function criarFiltro(empresaId, opcoes) {
    const filtro = { empresaId };

    if (opcoes.search) {
        filtro.nome = {
            $regex: escaparRegex(opcoes.search),
            $options: "i",
        };
    }

    if (opcoes.categoria && opcoes.categoria !== "todas") {
        filtro.categoria = opcoes.categoria;
    }

    if (opcoes.tipo && opcoes.tipo !== "todos") {
        filtro.tipo = opcoes.tipo;
    }

    return filtro;
}

async function listarPagina(filtro, empresaId, opcoes) {
    const [total, insumos] = await Promise.all([
        Insumo.countDocuments(filtro),
        Insumo.find(filtro)
            .sort({ createdAt: -1, _id: -1 })
            .skip(opcoes.skip)
            .limit(opcoes.limit)
            .populate("transformacao.ingredientes.insumo")
            .lean(),
    ]);

    const ids = insumos.map((insumo) => insumo._id);
    const idsDaPagina = new Set(ids.map((id) => id.toString()));
    const idsPais = [
        ...new Set(insumos.map((insumo) => insumo.origem?.insumoPai?.toString()).filter(Boolean)),
    ];

    const [processados, fichas, pais] = await Promise.all([
        ids.length
            ? Insumo.find({
                  empresaId,
                  "origem.insumoPai": { $in: ids },
              })
                  .select("origem.insumoPai")
                  .lean()
            : [],
        ids.length
            ? FichaTecnica.find({
                  empresaId,
                  "ingredientes.insumo": { $in: ids },
              })
                  .select("ingredientes.insumo")
                  .lean()
            : [],
        idsPais.length
            ? Insumo.find({
                  empresaId,
                  _id: { $in: idsPais },
              })
                  .select("_id nome")
                  .lean()
            : [],
    ]);

    const processadosPorPai = new Map();
    const fichasPorInsumo = new Map();
    const paisPorId = new Map(pais.map((pai) => [pai._id.toString(), pai]));

    for (const processado of processados) {
        const paiId = processado.origem?.insumoPai?.toString();
        if (paiId) {
            processadosPorPai.set(paiId, (processadosPorPai.get(paiId) || 0) + 1);
        }
    }

    for (const ficha of fichas) {
        const ingredientesDaFicha = new Set(
            (ficha.ingredientes || [])
                .filter((item) => item?.insumo)
                .map((item) => item.insumo.toString())
                .filter((id) => idsDaPagina.has(id))
        );

        for (const insumoId of ingredientesDaFicha) {
            fichasPorInsumo.set(insumoId, (fichasPorInsumo.get(insumoId) || 0) + 1);
        }
    }

    const data = insumos.map((insumo) => {
        const insumoId = insumo._id.toString();
        const pai = paisPorId.get(insumo.origem?.insumoPai?.toString());

        return mapInsumo({
            ...insumo,
            quantidadeProcessados: processadosPorPai.get(insumoId) || 0,
            usadoEmFichas: fichasPorInsumo.get(insumoId) || 0,
            insumoPaiNome: pai?.nome || null,
        });
    });

    return {
        data,
        pagination: criarMetadadosPaginacao({
            page: opcoes.page,
            limit: opcoes.limit,
            total,
        }),
    };
}

async function listarTodos(filtro, empresaId) {
    const [insumos, fichas] = await Promise.all([
        Insumo.find(filtro).populate("transformacao.ingredientes.insumo").lean(),
        FichaTecnica.find({ empresaId }).select("ingredientes.insumo").lean(),
    ]);

    const insumosPorId = new Map();
    const processadosPorPai = new Map();
    const fichasPorInsumo = new Map();

    for (const insumo of insumos) {
        const insumoId = insumo._id.toString();
        insumosPorId.set(insumoId, insumo);

        const insumoPaiId = insumo.origem?.insumoPai?.toString();
        if (insumoPaiId) {
            processadosPorPai.set(insumoPaiId, (processadosPorPai.get(insumoPaiId) || 0) + 1);
        }
    }

    for (const ficha of fichas) {
        const ingredientesDaFicha = new Set(
            (ficha.ingredientes || [])
                .filter((item) => item?.insumo)
                .map((item) => item.insumo.toString())
        );

        for (const insumoId of ingredientesDaFicha) {
            fichasPorInsumo.set(insumoId, (fichasPorInsumo.get(insumoId) || 0) + 1);
        }
    }

    const data = insumos.map((insumo) => {
        const insumoId = insumo._id.toString();
        const pai = insumosPorId.get(insumo.origem?.insumoPai?.toString());

        return mapInsumo({
            ...insumo,
            quantidadeProcessados: processadosPorPai.get(insumoId) || 0,
            usadoEmFichas: fichasPorInsumo.get(insumoId) || 0,
            insumoPaiNome: pai?.nome || null,
        });
    });

    return { data };
}

export const listarInsumosService = async (empresaId, opcoes = { paginado: false }) => {
    const filtro = criarFiltro(empresaId, opcoes);

    return opcoes.paginado
        ? listarPagina(filtro, empresaId, opcoes)
        : listarTodos(filtro, empresaId);
};
