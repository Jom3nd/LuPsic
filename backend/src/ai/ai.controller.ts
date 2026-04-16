import { Request, Response } from "express";
import { processarIA } from "./ai.service";

function formatarResposta(respostaIA: any) {
    return typeof respostaIA === "string"
        ? respostaIA
        : JSON.stringify(respostaIA, null, 2);
}

// tipo opcional para evitar erro no TS
interface AuthRequest extends Request { // interface para tipagem do request com usuário opcional, garantindo que as rotas possam acessar o ID do usuário autenticado
    user?: {
        id: number;
    };
}

export async function resumo(req: AuthRequest, res: Response) {
    const { texto } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const resposta = await processarIA(`Faça um resumo clínico:\n${texto}`, userId);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function relatorio(req: AuthRequest, res: Response) {
    const { texto } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const resposta = await processarIA(`Gere um relatório psicológico:\n${texto}`, userId);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function sentimento(req: AuthRequest, res: Response) {
    const { texto } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const resposta = await processarIA(`Analise o sentimento:\n${texto}`, userId);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function perguntas(req: AuthRequest, res: Response) {
    const { texto } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const resposta = await processarIA(`Sugira perguntas terapêuticas:\n${texto}`, userId);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function plano(req: AuthRequest, res: Response) {
    const { texto } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const resposta = await processarIA(`Crie um plano terapêutico:\n${texto}`, userId);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function chat(req: AuthRequest, res: Response) {
    const { mensagem } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const resposta = await processarIA(mensagem, userId);

    res.json({ resposta: formatarResposta(resposta) });
}