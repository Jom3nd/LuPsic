import prisma from "../lib/prisma";

// ========================================
// UTIL: interpreta datas humanas
// ========================================
function interpretarDataTexto(texto: string): Date {
    const agora = new Date();
    const valor = texto.toLowerCase().trim();


    if (valor.includes("amanhã")) {
        const data = new Date();
        data.setDate(agora.getDate() + 1);

        const horaMatch = valor.match(/(\d{1,2})[:h](\d{2})?/);

        const hora = horaMatch ? Number(horaMatch[1]) : 9;
        const minuto = horaMatch?.[2] ? Number(horaMatch[2]) : 0;

        data.setHours(hora, minuto, 0, 0);

        return data;
    }

    // se vier formato normal ISO ou data válida
    const dataNormal = new Date(texto);

    if (!isNaN(dataNormal.getTime())) {
        return dataNormal;
    }

    throw new Error("Data inválida");
}

interface CriarSessaoDTO {
    pacienteId: number;
    dataTexto?: string;
    data?: string | Date;
    observacao?: string;
    agendamentoId?: number; // Vinculo novo opcional
}

interface AtualizarSessaoDTO {
    dataTexto?: string;
    data?: string | Date;
    observacao?: string;
    pacienteId?: number;
}


export async function criarSessao(data: CriarSessaoDTO, profissionalId: number) {
    if (!data.pacienteId) {
        throw new Error("Paciente obrigatório");
    }

    // Verificar se o paciente pertence ao usuário
    const paciente = await prisma.paciente.findUnique({
        where: {
            id: Number(data.pacienteId)
        }
    });

    // Se houver um agendamentoId opcional, pode atualizar o agendamento em paralelo
    if (data.agendamentoId) {
        await prisma.agendamento.update({
            where: { id: Number(data.agendamentoId) },
            data: { status: "CONFIRMADO" } // Se iniciou/criou a sessão, confirma a agenda
        });
    }

    if (!paciente) {
        throw new Error("Paciente não encontrado");
    }
    const dataOriginal = data.dataTexto || data.data;
    const dataFinal = dataOriginal ? interpretarDataTexto(String(dataOriginal)) : new Date();


    return await prisma.sessao.create({
        data: {
            dataHoraInicio: dataFinal,
            observacao: data.observacao ?? null,
            pacienteId: Number(data.pacienteId),
            usuarioId: profissionalId,
            agendamentoId: data.agendamentoId ? Number(data.agendamentoId) : null
        },

        include: {
            paciente: {
                include: {
                    usuario: {select:{nome: true}}
                }
            }
        }
    });
}

export async function listarSessoes(userId: number) {
    return await prisma.sessao.findMany({
        where: { usuarioId: userId },
        include: {
            paciente: {
                include: {
                    usuario: {select:{nome: true}}
                }
            }
        },
        orderBy: {
            dataHoraInicio: "asc"
        }
    });
}

export async function getSessaoById(id: number, profissionalId: number) {
    return await prisma.sessao.findFirst({
        where: {
            id: Number(id),
            usuarioId: profissionalId
        },
        include: {
            paciente: {
                include: {
                    usuario: { select: { nome: true } }
                }
            },
            respostas: true // Traz também as respostas de IA atreladas
        }
    });
}

export async function atualizarSessao(id: number, data: AtualizarSessaoDTO, profissionalId: number) {
    // 1. Verificar se a sessão existe e pertence ao profissional logado
    const sessaoExistente = await getSessaoById(id, profissionalId);
    if (!sessaoExistente) throw new Error("Sessão não encontrada ou acesso negado");

    // 2. Trata a data de forma segura se ela foi enviada, caso contrário mantém a atual
    const dataOriginal = data.dataTexto || data.data;
    const dataFinal = dataOriginal ? interpretarDataTexto(String(dataOriginal)) : sessaoExistente.dataHoraInicio;

    // 3. Atualiza no banco mapeando os tipos corretamente
    return await prisma.sessao.update({
        where: { id: Number(id) },
        data: {
            dataHoraInicio: dataFinal,
            // Se vier undefined (não enviado), o Prisma ignora o campo. Se vier null ou string, ele aplica.
            observacao: data.observacao !== undefined ? data.observacao : sessaoExistente.observacao,
            pacienteId: data.pacienteId ? Number(data.pacienteId) : undefined
        },
        include: {
            paciente: {
                include: {
                    usuario: {
                        select: {
                            nome: true
                        }
                    }
                }
            }
        }
    });
}

export async function deletarSessao(id: number, userId: number) {
    // Verificar se a sessão pertence ao usuário
    const sessaoExistente = await getSessaoById(id, userId);
    if (!sessaoExistente) throw new Error("Sessão não encontrada ou acesso negado");

    return await prisma.sessao.delete({
        where: { id: Number(id) }
    });
}