import {Request , Response} from 'express';
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

