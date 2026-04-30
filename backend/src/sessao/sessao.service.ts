import prisma from "../lib/prisma";

export async function criarSessao(data: any) {
    return await prisma.sessao.create({
        data: {
            dataHoraInicio: new Date(data.data),
            observacao: data.observacao ?? null,
            pacienteId: Number(data.pacienteId),
            usuarioId: Number(data.usuarioId)
        }
    });
}

export async function listarSessoes() {
    return await prisma.sessao.findMany({
        include: {
            paciente: true,
            usuario: true
        },
        orderBy: {
            dataHoraInicio: "asc"
        }
    });
}

export async function getSessaoById(id: number) {
    return await prisma.sessao.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            paciente: true,
            usuario: true
        }
    });
}

export async function atualizarSessao(id: number, data: any) {
    return await prisma.sessao.update({
        where: {
            id: Number(id)
        },
        data: {
            dataHoraInicio: new Date(data.data),
            observacao: data.observacao ?? null,
            pacienteId: Number(data.pacienteId),
            usuarioId: Number(data.usuarioId)
        }
    });
}

export async function deletarSessao(id: number) {
    return await prisma.sessao.delete({
        where: {
            id: Number(id)
        }
    });
}