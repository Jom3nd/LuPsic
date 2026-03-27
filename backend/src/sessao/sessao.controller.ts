import {Request , Response} from 'express';
import prisma from '../lib/prisma';
import * as sessaoService from './sessao.service';

export async function criarSessao(req: Request, res: Response){

    try {
        const sessao = await sessaoService.criarSessao(req.body);
        return res.status(201).json(sessao);
    }catch(erro){
        return res.status(500).json({error: 'Erro ao criar sessão'});
    }
}

export async function listarSessoes(req:Request, res:Response){

    try {
        const sessoes = await sessaoService.listarSessoes();
        return res.status(200).json(sessoes);
    }catch(erro){
        return res.status(500).json({error: 'Erro ao listar sessões'});
    }
}

export async function getSessaoById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const sessao = await sessaoService.getSessaoById(id);
        return res.json(sessao);
    }catch(error) {
        return res.status(500).json({ error: "Erro ao buscar sessão" });
    }
}

export async function atualizarSessao(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const sessao = await sessaoService.atualizarSessao(id, req.body);
        return res.json(sessao);
    }catch(error) {
        return res.status(500).json({ error: "Erro ao atualizar sessão" });
    }
}

export async function deletarSessao(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        await sessaoService.deletarSessao(id);
        return res.status(204).send();
    }catch(error) {
        return res.status(500).json({ error: "Erro ao deletar sessão" });
    }
}
export async function listarSessoesPassadas(req: Request, res: Response) {

    try {
        const pacienteId = Number(req.params.pacienteId);
        const where = {
        pacienteId,
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
        const pacienteId = Number(req.params.pacienteId);
        const where = {
        pacienteId,
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

