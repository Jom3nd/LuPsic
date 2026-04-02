import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function criarSessao(data:any){

    return await prisma.sessao.create({
        data: {
            data: new Date (data.data),
            observacao: data.observacao,
            pacienteId: data.pacienteId,
            usuarioId: data.usuarioId
        },
    });
}

export async function listarSessoes(){

    return await prisma.sessao.findMany({
        include: {
            paciente : true,
            usuario: true
        },
    });
}

export async function getSessaoById(id: number) {

    return await prisma.sessao.findUnique({
        where: { id },
        include: {
            paciente: true,
            usuario: true,
        },
    });
}

export async function atualizarSessao(id: number, data: any) {
    
    return await prisma.sessao.update({
        where: {id},
        data: {
            data: new Date (data.data),
            observacao: data.observacao,
            pacienteId: data.pacienteId,
            usuarioId: data.usuarioId
        },
    });
}

export async function deletarSessao(id: number) {

    return await prisma.sessao.delete({
        where: {id}
    });
}