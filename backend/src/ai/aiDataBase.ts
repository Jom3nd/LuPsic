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
    if (!usuarioId) {
    throw new Error("Usuário não informado"); //Validação do usuárioId para garantir que a resposta seja associada a um usuário específico
}
    
    const respostaIA = await processarIA(texto, usuarioId!);

    // evita erro com objeto
    const respostaFormatada =
        typeof respostaIA === "string"
            ? respostaIA
            : JSON.stringify(respostaIA, null, 2);

    // modelo híbrido
    const modelo = "hybrid";

    const registro = await prisma.iAResponse.create({
        data: {
            tipo,
            modelo,
            prompt: texto,
            resposta: respostaFormatada,
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