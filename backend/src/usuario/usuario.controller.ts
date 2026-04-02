import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function criarUsuario(req: Request, res: Response) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    try {
        const usuario = await prisma.usuario.create({
        data: { nome, email, senha },
    });

    return res.status(201).json(usuario);
    } catch (error: any) {
    if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email já cadastrado' });
    }

    return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
}

export async function listarUsuarios(req: Request, res: Response) {
    try {
        const usuarios = await prisma.usuario.findMany();
        return res.status(200).json(usuarios);
    } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
}

export async function deletarUsuario(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
        await prisma.usuario.delete({
        where: { id },
    });

    return res.status(204).send();
    } catch (error: any) {
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
}

export async function atualizarUsuario(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { nome, email, senha } = req.body;

    try {
        const usuario = await prisma.usuario.update({
        where: { id },
        data: { nome, email, senha },
    });

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