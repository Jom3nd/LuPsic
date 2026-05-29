import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

const salaSelect = { 
    id: true,
    nome: true,
    numeroDaSala: true,
    situacao: true
};

export async function listarSalas() {
    return await prisma.sala.findMany({
        select: salaSelect
    });
}

export async function criarSala(id: number,nome: string, numeroDaSala: number) {
    return await prisma.sala.create({
        data: {
            id,
            nome,
            numeroDaSala
        }
    });
}

export async function obterSalaPorId(id: number) {
    return await prisma.sala.findUnique({
        where: { id },
        select: salaSelect
    });
}

export async function atualizarSala(id: number, data: Partial<Omit<Prisma.SalaUpdateInput, 'id' | 'agendamentos'>>) {
    return await prisma.sala.update({
        where: { id },
        data
    });
}

export async function deletarSala(id: number) {
    return await prisma.sala.delete({
        where: { id }
    });
}

export async function verificarHorarioLivre(dataHoraInicio: Date, dataHoraFim: Date) {
    // Busca salas ativas que NÃO possuem agendamentos conflitantes
    const salasDisponiveis = await prisma.sala.findMany({
        where: {
            situacao: true,
            agendamentos: {
                none: {
                    status: {
                        in: ['PENDENTE', 'CONFIRMADO']
                    },
                    dataHoraInicio: {
                        lt: dataHoraFim
                    },
                    dataHoraFim: {
                        gt: dataHoraInicio
                    }
                }
            }
        },
        select: {
            id: true,
            nome: true,
            numeroDaSala: true
        }
    });

    return {
        temHorarioLivre: salasDisponiveis.length > 0,
        quantidadeLivres: salasDisponiveis.length,
        salasDisponiveis
    };
}