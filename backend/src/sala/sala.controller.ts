import { Request, Response } from 'express';
import * as salaService from './sala.service';

export async function listarSalas(req: Request, res: Response) {
    try {
        const salas = await salaService.listarSalas();
        return res.json(salas);
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao listar salas", details: error.message });
    }
}

export async function criarSala(req: Request, res: Response) {
    try {
        const { id, nome, numeroDaSala } = req.body;
        const sala = await salaService.criarSala(id, nome, numeroDaSala);
        return res.status(201).json(sala);
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao criar sala", details: error.message });
    }
}

export async function obterSala(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const sala = await salaService.obterSalaPorId(id);
        if (!sala) return res.status(404).json({ error: "Sala não encontrada" });
        return res.json(sala);
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao obter sala", details: error.message });
    }
}

export async function atualizarSala(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const { nome, numeroDaSala, situacao } = req.body;
        const sala = await salaService.atualizarSala(id, { nome, numeroDaSala, situacao });
        return res.json(sala);
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao atualizar sala", details: error.message });
    }
}

export async function deletarSala(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        await salaService.deletarSala(id);
        return res.status(204).send();
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao deletar sala", details: error.message });
    }
}

export async function verificarHorarioLivre(req: Request, res: Response) {
    try {
        const { dataHoraInicio, dataHoraFim } = req.body;
        const resultado = await salaService.verificarHorarioLivre(new Date(dataHoraInicio), new Date(dataHoraFim));
        return res.json(resultado);
    } catch (error: any) {
        return res.status(400).json({ error: "Erro ao verificar horario livre", details: error.message }); 
    }
}