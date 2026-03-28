import prisma from "../lib/prisma";
import { chatAssistente } from "./ai.service";

// Cria resposta da IA e salva no banco
export async function criarRespostaIA(sessaoId: number, tipo: string, mensagem: string) {
  // 1. Chama o chat da IA
    const respostaIA = await chatAssistente(mensagem);

  // 2. Salva no banco
    const registro = await prisma.iAResponse.create({
        data: {
        sessaoId,
        tipo,
        prompt: mensagem,
        resposta: respostaIA as string, // Asserção de tipo para garantir que respostaIA não seja nula
    },
});

    return registro;
}