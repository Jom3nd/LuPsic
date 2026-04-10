import { Request, Response } from "express";
import { processarIA } from "./ai.service";


function formatarResposta(respostaIA: any) {
    return typeof respostaIA === "string"
        ? respostaIA
        : JSON.stringify(respostaIA, null, 2);
}

export async function resumo(req: Request, res: Response) {
    const { texto } = req.body;

    const resposta = await processarIA(`Faça um resumo clínico:\n${texto}`);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function relatorio(req: Request, res: Response) {
    const { texto } = req.body;

    const resposta = await processarIA(`Gere um relatório psicológico:\n${texto}`);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function sentimento(req: Request, res: Response) {
    const { texto } = req.body;

    const resposta = await processarIA(`Analise o sentimento:\n${texto}`);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function perguntas(req: Request, res: Response) {
    const { texto } = req.body;

    const resposta = await processarIA(`Sugira perguntas terapêuticas:\n${texto}`);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function plano(req: Request, res: Response) {
    const { texto } = req.body;

    const resposta = await processarIA(`Crie um plano terapêutico:\n${texto}`);

    res.json({ resposta: formatarResposta(resposta) });
}

export async function chat(req: Request, res: Response) {
    const { mensagem } = req.body;

    const resposta = await processarIA(mensagem);

    res.json({ resposta: formatarResposta(resposta) });
}