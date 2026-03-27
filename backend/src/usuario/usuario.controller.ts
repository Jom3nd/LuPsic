import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function criarUsuario(req: Request, res: Response) {
    const { nome, email, senha } = req.body;
    try {
        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha
            }
        });
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
}

export async function listarUsuarios(req: Request, res: Response) {

    try {
        const usuarios = await prisma.usuario.findMany();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
}

export async function deletarUsuario(req: Request, res: Response) {
    
    try {
        const id = Number(req.params.id);
        await prisma.usuario.delete({
            where: {id}
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário'
        })

    }
}

export async function atualizarUsuario(req: Request , res: Response) {

    try {
        const id = Number(req.params.id);
        const {nome,email,senha} = req.body;
        const usuario = await prisma.usuario.update({
            where :{id},
            data : {
                nome,
                email,
                senha
            }
        })
    }catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
}

