import prisma from "../lib/prisma";
import { processarIA } from "./ai.service";

// Cria resposta da IA e salva no banco
export async function criarRespostaIA(
    tipo: string,
    texto: string,
    sessaoId?: number,
    pacienteId?: number,
    usuarioId?: number
) {
    // 1. Processa IA (já escolhe modelo e prompt)
    const respostaIA = await processarIA(tipo, texto);

    // 2. Descobre qual modelo foi usado (opcional)
    let modelo = "phi3";
    if (["resumo", "relatorio", "sentimento", "plano"].includes(tipo)) {
        modelo = "llama3";
    }

    // 3. Salva no banco
    const registro = await prisma.iAResponse.create({
        data: {
            tipo,
            modelo,
            prompt: texto,
            resposta: respostaIA || "",
            sessaoId,
            pacienteId,
            usuarioId
        },
    });

    return registro;
}

// Buscar respostas da IA por sessão
export async function buscarRespostasPorSessao(sessaoId: number) {
    return await prisma.iAResponse.findMany({
        where: {
            sessaoId: sessaoId,
        },
        orderBy: {
            criadoEm: "desc",
        },
    });
}