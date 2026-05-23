import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

interface CriarPacienteDTO {
    name: string;
    email?: string;
    senha?: string;
    idade: number;
}

interface AtualizarPacienteDTO {
    name?: string;
    email?: string;
    senha?: string;
    idade?: number;
}

export async function criarPaciente(data: CriarPacienteDTO, userId: number) {
    if (data.senha) {
        data.senha = await bcrypt.hash(data.senha, 10);
    }
    return await prisma.paciente.create({
        data: {
            ...data,
            usuarioId: userId
        },
    });
}

export async function listarPacientes(userId: number) {
    return await prisma.paciente.findMany({
        where: { usuarioId: userId }
    });
}

export async function getPacienteById(id: number, userId: number) {
    return await prisma.paciente.findFirst({
        where: {
            id,
            usuarioId: userId
        }
    });
}

export async function atualizarPaciente(id: number, data: AtualizarPacienteDTO, userId: number) {
    // Primeiro verificamos se o paciente pertence ao usuário
    const paciente = await getPacienteById(id, userId);
    if (!paciente) throw new Error("Paciente não encontrado ou acesso negado");

    if (data.senha) {
        data.senha = await bcrypt.hash(data.senha, 10);
    }

    return await prisma.paciente.update({
        where: { id },
        data,
    });
}

export async function deletarPaciente(id: number, userId: number) {
    // Primeiro verificamos se o paciente pertence ao usuário
    const paciente = await getPacienteById(id, userId);
    if (!paciente) throw new Error("Paciente não encontrado ou acesso negado");

    return await prisma.paciente.delete({
        where: { id }
    });
}
