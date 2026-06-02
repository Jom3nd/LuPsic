import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

interface CriarPacienteDTO {
    nome: string;
    email: string;
    senha?: string;
    idade: number;
}

interface AtualizarPacienteDTO {
    nome?: string;
    email?: string;
    senha?: string;
    idade?: number;
}

export async function criarPaciente(data: CriarPacienteDTO, userId: number) {
    const hashSenha = data.senha ? await bcrypt.hash(data.senha,10)
        : await bcrypt.hash("senhaPadrao123", 10); // Senha padrão caso não seja fornecida
        
    return await prisma.$transaction(async (tx) => {
        const novoUsuario = await tx.usuario.create({
            data: {
                nome: data.nome,
                email: data.email,
                senha: hashSenha,
                role: "PACIENTE",
            }
        })
    return await tx.paciente.create({
        data: {
            idade: data.idade,
            usuarioId: novoUsuario.id,
            profissionalId: userId,
        },
        include: { usuario: true }
    });
    })
}

export async function listarPacientes(profissionalId: number) {
    return await prisma.paciente.findMany({
        where: {
            profissionalId: profissionalId
        },
        include: {
            usuario: {
                select: { id: true, nome: true, email: true, role: true }
            }
        }
    });
}

export async function getPacienteById(id: number) {
    return await prisma.paciente.findUnique({
        where: { id },
        include: {
            usuario: {
                select: { id: true, nome: true, email: true }
            }
        }
    });
}

export async function atualizarPaciente(id: number, data: AtualizarPacienteDTO, userId: number) {
    // Primeiro verificamos se o paciente pertence ao usuário
    const paciente = await getPacienteById(id);
    if (!paciente) throw new Error("Paciente não encontrado ou acesso negado");

    const dadosUsuario: any = {};
    if (data.nome) dadosUsuario.nome = data.nome;
    if (data.email) dadosUsuario.email = data.email;
    if (data.senha) dadosUsuario.senha = await bcrypt.hash(data.senha, 10);

    return await prisma.$transaction(async (tx) => {
        if (Object.keys(dadosUsuario).length > 0 && paciente.usuarioId) {
            await tx.usuario.update({
                where: { id: paciente.usuarioId },
                data: dadosUsuario,
            });
        }
    return await tx.paciente.update({
        where :{id},
        data: {
            idade: data.idade
        },
        include: {
            usuario : true
        }
    })
    })


    return await prisma.paciente.update({
        where: { id },
        data,
    });
}

export async function deletarPaciente(id: number) {
    const paciente = await getPacienteById(id);
    if (!paciente) throw new Error("Paciente não encontrado");

    return await prisma.$transaction(async (tx) => {
        // Remove o perfil clínico primeiro
        await tx.paciente.delete({ where: { id } });

        // Remove o usuário de autenticação correspondente
        if (paciente.usuarioId) {
            await tx.usuario.delete({ where: { id: paciente.usuarioId } });
        }
    });
}
