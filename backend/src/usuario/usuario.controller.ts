import { Request, Response } from 'express';
import * as usuarioService from './usuario.service';
import { AuthRequest } from '../types';

export async function criarUsuario(req: Request, res: Response) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    try {
        const usuario = await usuarioService.criarUsuario({ nome, email, senha });
        return res.status(201).json(usuario);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
}


export async function listarUsuarios(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const usuario = await usuarioService.buscarUsuarioPorId(userId);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
    }
}

export async function deletarUsuario(req: AuthRequest, res: Response) {
    const id = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (id !== userId) {
        return res.status(403).json({ error: 'Acesso negado: você só pode deletar sua própria conta' });
    }

    try {
        await usuarioService.deletarUsuario(id);
        return res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
}

export async function atualizarUsuario(req: AuthRequest, res: Response) {
    const id = Number(req.params.id);
    const userId = req.user?.id;
    const { nome, email, senha } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (id !== userId) {
        return res.status(403).json({ error: 'Acesso negado: você só pode atualizar sua própria conta' });
    }

    try {
        const usuario = await usuarioService.atualizarUsuario(id, { nome, email, senha });
        return res.status(200).json(usuario);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
}