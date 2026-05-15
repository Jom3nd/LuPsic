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


export async function criarSessao(data: any, userId: number) {
    if (!data.pacienteId) {
        throw new Error("Paciente obrigatório");
    }

    // Verificar se o paciente pertence ao usuário
    const paciente = await prisma.paciente.findFirst({
        where: {
            id: Number(data.pacienteId),
            usuarioId: userId
        }
    });

    if (!paciente) {
        throw new Error("Paciente não encontrado ou acesso negado");
    }

    const dataFinal = interpretarDataTexto(
        data.dataTexto || data.data
    );

    return await prisma.sessao.create({
        data: {
            dataHoraInicio: dataFinal,
            observacao: data.observacao ?? null,
            pacienteId: Number(data.pacienteId),
            usuarioId: userId
        }
    });
}

export async function listarSessoes(userId: number) {
    return await prisma.sessao.findMany({
        where: { usuarioId: userId },
        include: {
            paciente: true
        },
        orderBy: {
            dataHoraInicio: "asc"
        }
    });
}

export async function getSessaoById(id: number, userId: number) {
    return await prisma.sessao.findFirst({
        where: {
            id: Number(id),
            usuarioId: userId
        },
        include: {
            paciente: true
        }
    });
}

export async function atualizarSessao(id: number, data: any, userId: number) {
    // Verificar se a sessão pertence ao usuário
    const sessaoExistente = await getSessaoById(id, userId);
    if (!sessaoExistente) throw new Error("Sessão não encontrada ou acesso negado");

    const dataFinal = interpretarDataTexto(
        data.dataTexto || data.data
    );

    return await prisma.sessao.update({
        where: { id: Number(id) },
        data: {
            dataHoraInicio: dataFinal,
            observacao: data.observacao ?? null,
            pacienteId: data.pacienteId ? Number(data.pacienteId) : undefined
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