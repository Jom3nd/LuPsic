import { StatusAgendamento } from "@prisma/client";
import prisma from "../lib/prisma";

const EMAIL_SALA_PRIVADA = process.env.EMAIL_ADDRESS;

export async function criarAgendamento(dataHoraInicio: string, dataHoraFim: string, observacao: string, usuarioId: number, pacienteId: number, salaId: number) {
    // 1. Busca os detalhes da sala e do usuário simultaneamente para validação
    const [sala, usuario] = await Promise.all([
        prisma.sala.findUnique({ where: { id: (salaId) } }),
        prisma.usuario.findUnique({ where: { id: (usuarioId) } })
    ]);

    if (!sala) throw new Error("Sala não encontrada no sistema.");
    if (!usuario) throw new Error("Usuário não encontrado.");

    // 2. Validação da Sala 02 (Amor) - Privativa de forma segura
    // Também adicionamos a checagem se o usuário é MASTER como redundância de segurança
    if (sala.numeroDaSala === 2) {
        const ehODono = usuario.email === EMAIL_SALA_PRIVADA;
        const ehMaster = usuario.role === "MASTER";

        if (!ehODono && !ehMaster) {
            throw new Error("Acesso negado: A Sala 02 é de uso privativo.");
        }
    }

    // 3. Validação da Sala 05 (Resiliência) - Almoxarifado
    if (sala.numeroDaSala === 5 && sala.situacao === "INATIVA") {
        throw new Error("Agendamento bloqueado: A Sala 05 está atualmente configurada como almoxarifado.");
    }
    if (sala.situacao !== "ATIVA") {
        throw new Error(`Agendamento bloqueado: Esta sala está com status de ${sala.situacao}.`);
    }

    // 4. Validação de Conflito de Horários (Ignora bloqueio se for a Sala 09)
    if (sala.numeroDaSala !== 9) {
        const agendamentoConflitante = await prisma.agendamento.findFirst({
            where: {
                salaId: Number(salaId),
                status: {
                    not: "CANCELADO"
                },
                AND: [
                    { dataHoraInicio: { lt: new Date(dataHoraFim) } },
                    { dataHoraFim: { gt: new Date(dataHoraInicio) } }
                ]
            }
        });

        if (agendamentoConflitante) {
            throw new Error("Já existe um agendamento nesta sala para o horário selecionado.");
        }
    }

    return prisma.agendamento.create({
        data: {
            dataHoraInicio: new Date(dataHoraInicio),
            dataHoraFim: new Date(dataHoraFim),
            observacao,
            usuarioId: (usuarioId),
            pacienteId: (pacienteId),
            salaId: (salaId),
            status: "PENDENTE"
        }
    });
}

export async function listarAgendamentosPorRole(role: string, userId: number) {
    // Definimos um objeto de inclusão padrão para garantir que PACIENTE e SALA
    // sempre venham juntos na consulta, trazendo seus respectivos nomes.
    const inclusaoPadrao = {
        paciente: {
            include: {
                usuario: {
                    select: {
                        nome: true // O nome agora mora na tabela Usuario
                    }
                }
            }
        },
        sala: {
            select: {
                nome: true 
            }
        }
    };

    if (role === "MASTER" || role === "FUNCIONARIO") {
        return prisma.agendamento.findMany({
            include: {
                ...inclusaoPadrao,
                usuario: {
                    select: { nome: true } // Nome do profissional que vai atender
                }
            },
            orderBy: { dataHoraInicio: 'asc' }
        });
    } else if (role === "PROFISSIONAL") {
        return prisma.agendamento.findMany({
            where: { usuarioId: userId },
            include: inclusaoPadrao,
            orderBy: { dataHoraInicio: 'asc' }
        });
    } else {
        // Se for PACIENTE: O userId recebido do login bate com o 'usuarioId' da tabela Paciente
        return prisma.agendamento.findMany({
            where: { 
                paciente: {
                    usuarioId: userId // Garante o filtro correto para o paciente logado
                }
            },
            include: {
                ...inclusaoPadrao,
                usuario: {
                    select: { nome: true } // Nome do profissional atendente
                }
            },
            orderBy: { dataHoraInicio: 'asc' }
        });
    }
}

export async function atualizarStatusAgendamento(id: number, status: StatusAgendamento) {
    return prisma.agendamento.update({
        where: { id },
        data: { status }
    });
}
