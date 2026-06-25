import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import bcrypt from 'bcrypt';

//Evita vazamento de dados selecionando apenas o necessário do Usuário
const usuarioSelect = { 
    id: true,
    nome: true,
    email: true,
    especialidade: true,
    criadoEm: true,
    role: true
};

export async function criarUsuario(data: Prisma.UsuarioCreateInput & { especialidade?: string }) {
    const hashSenha = await bcrypt.hash(data.senha, 10);
    return await prisma.usuario.create({
        data: {
            ...data,
            senha: hashSenha,
        },
        select: usuarioSelect
    });
}

export async function buscarUsuarioPorId(id: number) {
    return await prisma.usuario.findUnique({
        where: { id },
        select: usuarioSelect
    });
}

export async function deletarUsuario(id: number) {
    return await prisma.usuario.delete({
        where: { id }
    });
}

export async function atualizarUsuario(id: number, data: { nome?: string, email?: string, senha?: string, especialidade?: string }) {
    const updateData: Prisma.UsuarioUpdateInput = {};

    if (data.nome) updateData.nome = data.nome;
    if (data.email) updateData.email = data.email;
    if (data.especialidade) updateData.especialidade = data.especialidade;
    if (data.senha) {
        updateData.senha = await bcrypt.hash(data.senha, 10);
    }

    return await prisma.usuario.update({
        where: { id },
        data: updateData,
        select: usuarioSelect
    });
}

export async function listarProfissionais() {
    return await prisma.usuario.findMany({
        where: { role: "PROFISSIONAL" },
        select: {
            id: true,
            nome: true,
            email: true,
            especialidade: true
        }
    });
}