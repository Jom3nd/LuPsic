import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function criarPaciente(data:any) {
    
    return await prisma.paciente.create({
        data,
    });
}
export async function listarPacientes(){
    return await prisma.paciente.findMany();
}

export async function getPacienteById(id:number){
    return await prisma.paciente.findUnique({
        where: {id}
    })
}

export async function atualizarPaciente(id:number, data:any){
    return await prisma.paciente.update({
        where: {id},
        data,
    })
}
export async function deletarPaciente(id:number){
    return await prisma.paciente.delete({
        where : {id}
    })
}