import { Request, Response } from "express";
import { processarIA } from "./ai.service";

export async function resumo(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await processarIA("resumo", texto);
    res.json({ resposta });
}

export async function relatorio(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await processarIA("relatorio", texto);
    res.json({ resposta });
}

export async function sentimento(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await processarIA("sentimento", texto);
    res.json({ resposta });
}

export async function perguntas(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await processarIA("perguntas", texto);
    res.json({ resposta });
}

export async function plano(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await processarIA("plano", texto);
    res.json({ resposta });
}

export async function chat(req: Request, res: Response) {
    const { mensagem } = req.body;
    const resposta = await processarIA("chat", mensagem);
    res.json({ resposta });
}