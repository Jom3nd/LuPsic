import {Request , Response} from 'express';
import prisma from '../lib/prisma';
import * as sessaoService from './sessao.service';

export async function criarSessao(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const sessao = await sessaoService.criarSessao(req.body, userId);
        return res.status(201).json(sessao);
    } catch (erro: any) {
        return res.status(500).json({ error: erro.message || 'Erro ao criar sessão' });
    }
}

export async function listarSessoes(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const sessoes = await sessaoService.listarSessoes(userId);
        return res.status(200).json(sessoes);
    } catch (erro) {
        return res.status(500).json({ error: 'Erro ao listar sessões' });
    }
}

export async function getSessaoById(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const id = Number(req.params.id);
        const sessao = await sessaoService.getSessaoById(id, userId);

        if (sessao) {
            return res.json(sessao);
        } else {
            return res.status(404).json({ error: 'Sessão não encontrada' });
        }
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar sessão" });
    }
}

export async function atualizarSessao(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const id = Number(req.params.id);
        const sessao = await sessaoService.atualizarSessao(id, req.body, userId);
        return res.json(sessao);
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Erro ao atualizar sessão" });
    }
}

export async function deletarSessao(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const id = Number(req.params.id);
        await sessaoService.deletarSessao(id, userId);
        return res.status(204).send();
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Erro ao deletar sessão" });
    }
}

export async function listarSessoesPassadas(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const pacienteId = Number(req.params.pacienteId);

        // Verificar se o paciente pertence ao usuário
        const paciente = await prisma.paciente.findFirst({
            where: { id: pacienteId, usuarioId: userId }
        });

        if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

        const where = {
            pacienteId,
            usuarioId: userId,
            dataHoraInicio: {
                lt: new Date(),
            },
        };
        const sessoes = await prisma.sessao.findMany({
            where,
            orderBy: {
                dataHoraInicio: 'asc',
            },
        });

        res.status(200).json(sessoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar sessões passadas' });
    }
}

export async function listarSessoesFuturas(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const pacienteId = Number(req.params.pacienteId);

        // Verificar se o paciente pertence ao usuário
        const paciente = await prisma.paciente.findFirst({
            where: { id: pacienteId, usuarioId: userId }
        });

        if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

        const where = {
            pacienteId,
            usuarioId: userId,
            dataHoraInicio: {
                gt: new Date(),
            },
        };
        const sessoes = await prisma.sessao.findMany({
            where,
            orderBy: {
                dataHoraInicio: 'asc',
            },
        });

        res.status(200).json(sessoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar sessões futuras' });
    }
}


