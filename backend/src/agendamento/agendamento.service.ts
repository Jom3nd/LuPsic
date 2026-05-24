import prisma from "../lib/prisma";

export async function criarAgendamento(dataHoraInicio: string, dataHoraFim: string, observacao: string, usuarioId: number, pacienteId: number, salaId: number) {
    return prisma.agendamento.create({
        data: {
            dataHoraInicio: new Date(dataHoraInicio),
            dataHoraFim: new Date(dataHoraFim),
            observacao,
            usuarioId: Number(usuarioId),
            pacienteId: Number(pacienteId),
            salaId: Number(salaId),
            status: "PENDENTE"
        }
    });
}

export async function listarAgendamentosPorRole(role: string, userId: number) {
    if (role === "MASTER" || role === "FUNCIONARIO") {
        return prisma.agendamento.findMany({
            include: { paciente: true, usuario: true },
            orderBy: { dataHoraInicio: 'asc' }
        });
    } else if (role === "PSICOLOGO") {
        return prisma.agendamento.findMany({
            where: { usuarioId: userId },
            include: { paciente: true },
            orderBy: { dataHoraInicio: 'asc' }
        });
    } else {
        // Se for paciente
        return prisma.agendamento.findMany({
            where: { pacienteId: userId },
            include: { usuario: true },
            orderBy: { dataHoraInicio: 'asc' }
        });
    }
}

export async function atualizarStatusAgendamento(id: number, status: "PENDENTE" | "CONFIRMADO" | "CANCELADO") {
    return prisma.agendamento.update({
        where: { id },
        data: { status }
    });
}
