import { Request, Response } from "express";
import { processarIA } from "./ai.service";
import { chamarOllamaComIA } from "./ollama.client";
import { toolMap, validarTool } from "./ai.tools";

function formatarResposta(respostaIA: any) {
    return typeof respostaIA === "string"
        ? respostaIA
        : JSON.stringify(respostaIA, null, 2);
}

async function executarComIA(
    req: Request,
    res: Response,
    prompt: string
) {
    const userId = (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({
            tipo: "erro",
            message: "Usuário não autenticado"
        });
    }

    const resposta = await processarIA(prompt, userId);

    return res.json({
        resposta: formatarResposta(resposta)
    });
}

export async function resumo(req: Request, res: Response) {
    const { texto } = req.body;
    return executarComIA(req, res, `Faça um resumo clínico:\n${texto}`);
}

export async function relatorio(req: Request, res: Response) {
    const { texto } = req.body;
    return executarComIA(req, res, `Gere um relatório psicológico:\n${texto}`);
}

export async function sentimento(req: Request, res: Response) {
    const { texto } = req.body;
    return executarComIA(req, res, `Analise o sentimento:\n${texto}`);
}

export async function perguntas(req: Request, res: Response) {
    const { texto } = req.body;
    return executarComIA(req, res, `Sugira perguntas terapêuticas:\n${texto}`);
}

export async function plano(req: Request, res: Response) {
    const { texto } = req.body;
    return executarComIA(req, res, `Crie um plano terapêutico:\n${texto}`);
}


export async function chat(req: Request, res: Response) {
    try {
        const { message } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Usuário não autenticado"
            });
        }

        if (!message) {
            return res.status(400).json({
                message: "Mensagem obrigatória"
            });
        }

        // IA interpreta comando
        const aiResult = await chamarOllamaComIA("phi3", message);
        console.log("Resultado da interpretação da IA:", aiResult);

        // erro de interpretação
        if (!aiResult || aiResult.action === "erro") {
            return res.status(400).json({
                message: "Não consegui interpretar o comando."
            });
        }

        // conversa natural
        if (aiResult.action === "responder") {
            const respostaNatural = await chamarOllamaComIA("llama3", message);

            return res.json({
                message: respostaNatural
            });
        }

        // valida se action existe e parâmetros corretos
        if (!validarTool(aiResult)) {
            return res.status(400).json({
                message: "Comando inválido."
            });
        }

        // pega função correspondente
        const executar = toolMap[aiResult.action];

        if (!executar) {
            return res.status(400).json({
                message: "Ação não encontrada."
            });
        }

        // executa com segurança
        const resultado = await executar(aiResult.data, userId);

        return res.json(resultado);

    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: error.message || "Erro interno do servidor"
        });
    }
}