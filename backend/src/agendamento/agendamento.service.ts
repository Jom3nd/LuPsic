import prisma from "../lib/prisma";

const EMAIL_SALA_PRIVADA = process.env.EMAIL_ADDRESS;

export async function criarAgendamento(dataHoraInicio: string, dataHoraFim: string, observacao: string, usuarioId: number, pacienteId: number, salaId: number) {
    // 1. Busca os detalhes da sala e do usuário simultaneamente para validação
    const [sala, usuario] = await Promise.all([
        prisma.sala.findUnique({ where: { id: Number(salaId) } }),
        prisma.usuario.findUnique({ where: { id: Number(usuarioId) } })
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
    if (sala.numeroDaSala === 5 && !sala.situacao) {
        throw new Error("Agendamento bloqueado: A Sala 05 está atualmente configurada como almoxarifado.");
    }

    // 4. Validação de Conflito de Horários (Ignora bloqueio se for a Sala 09)
    if (sala.numeroDaSala !== 9) {
        const agendamentoConflitante = await prisma.agendamento.findFirst({
            where: {
                salaId: Number(salaId),
                status: {
                    not: "CANCELADO"
                },
                OR: [
                    {
                        dataHoraInicio: { lt: new Date(dataHoraFim) },
                        dataHoraFim: { gt: new Date(dataHoraInicio) }
                    }
                ]
            }
        });

        if (agendamentoConflitante) {
            throw new Error("Já existe um agendamento nesta sala para o horário selecionado.");
        }
    }

    // 5. Tudo certo! Cria o agendamento no banco.
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
    // Definimos um objeto de inclusão padrão para garantir que PACIENTE e SALA
    // sempre venham juntos na consulta, trazendo seus respectivos nomes.
    const inclusaoPadrao = {
        paciente: {
            select: {
                name: true // Traz apenas o nome do paciente (ajuste para 'nome' se mudou no banco, mas seu schema diz 'name')
            }
        },
        sala: {
            select: {
                nome: true // Traz o nome da sala (Ex: "Sala 01 — Compaixão")
            }
        }
    };

    if (role === "MASTER" || role === "FUNCIONARIO") {
        // Master e Funcionário veem tudo, incluindo também os dados do profissional (usuario) se necessário
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
        // O profissional vê apenas os seus próprios agendamentos
        return prisma.agendamento.findMany({
            where: { usuarioId: userId },
            include: inclusaoPadrao,
            orderBy: { dataHoraInicio: 'asc' }
        });
    } else {
        // Se for paciente, vê apenas os seus agendamentos e traz junto o nome do profissional
        return prisma.agendamento.findMany({
            where: { pacienteId: userId },
            include: {
                ...inclusaoPadrao,
                usuario: {
                    select: { nome: true } // Nome do profissional para o paciente saber com quem vai se consultar
                }
            },
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
