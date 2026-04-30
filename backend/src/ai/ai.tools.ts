import prisma from "../lib/prisma";

export const tools = [
    {
    name: "criar_paciente",
    description: "Cria um paciente no sistema",
    parameters: {
        nome: "string",
        idade: "number",
    },
},
    {
    name: "criar_sessao",
    description: "Agenda uma sessão",
    parameters: {
        pacienteId: "number",
        data: "string",
    },
},
];

// Funções reais (execução)
export async function criarPaciente(data: any, userId: number) {
    if (!data.nome || !data.idade) {
        throw new Error("Dados inválidos para paciente");
    }

    const paciente = await prisma.paciente.create({
        data: {
            name: data.nome,
            idade: data.idade,
            usuarioId: userId // Associa o paciente ao usuário que o criou
        },
    });

    return {
        tipo: "acao",
        message: "Paciente criado com sucesso",
        data: paciente,
    };
}

export async function criarSessao(data: any, userId: number) {
    if (!data.pacienteId || !data.data) {
        throw new Error("Dados inválidos para sessão");
    }

    //valida se o paciente pertence ao usuário
    const paciente = await prisma.paciente.findFirst({
        where: {
            id: data.pacienteId,
            usuarioId: userId
        }
    });

    if (!paciente) {
        throw new Error("Paciente não encontrado ou não pertence ao usuário");
    }

    const sessao = await prisma.sessao.create({
        data: {
            dataHoraInicio: new Date(data.data),

            paciente: {
                connect: { id: data.pacienteId }
            },

            usuario: {
                connect: { id: userId }
            }
        }
    });

    return {
        tipo: "acao",
        message: "Sessão criada com sucesso",
        data: sessao
    };
}

// Mapeamento das tools
export const toolMap: Record<string, Function> = {
    criar_paciente: criarPaciente,
    criar_sessao: criarSessao,
};

// Validação
export function validarTool(parsed: any) {
    const tool = tools.find((t) => t.name === parsed.action);
    if (!tool) return false;

    for (const key of Object.keys(tool.parameters)) {
    if (!(key in parsed.data)) return false;
}

    return true;
}