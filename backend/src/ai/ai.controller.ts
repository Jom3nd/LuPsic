import {Request, Response} from 'express';
import{ gerarPlanoTerapeutico, gerarRelatorio, resumirSessao, analisarSentimento, sugerirPerguntas, chatAssistente } from "./ai.service";
import {perguntarIA} from "./ai.service";

export async function chatAI(req: Request, res: Response) {

    try {
        const {mensagem} = req.body;
        await perguntarIA(mensagem);
        res.status(201).json({ resposta: "Resposta da IA enviada com sucesso!" });

    } catch (error) {
        res.status(500).json({ error: "Erro ao enviar mensagem para IA" });
    }
}
export async function resumo(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await resumirSessao(texto);
    res.status(201).json({ resposta });
}

export async function relatorio(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await gerarRelatorio(texto);
    res.status(201).json({ resposta });
}

export async function sentimento(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await analisarSentimento(texto);
    res.status(201).json({ resposta });
}

export async function perguntas(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await sugerirPerguntas(texto);
    res.status(201).json({ resposta });
}

export async function plano(req: Request, res: Response) {
    const { texto } = req.body;
    const resposta = await gerarPlanoTerapeutico(texto);
    res.status(201).json({ resposta });
}

export async function chat(req: Request, res: Response) {
    const { mensagem } = req.body;
    const resposta = await chatAssistente(mensagem);
    res.status(201).json({ resposta });
}