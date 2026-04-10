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

// 🔥 Funções reais (execução)
export async function criarPaciente(data: any) {
    if (!data.nome || !data.idade) {
        throw new Error("Dados inválidos para paciente");
    }

    const paciente = await prisma.paciente.create({
        data: {
        name: data.nome,
        idade: data.idade,
        },
    });

    return {
    tipo: "acao",
    message: "Paciente criado com sucesso",
    data: paciente,
    };
}

export async function criarSessao(data: any) {
    if (!data.pacienteId || !data.usuarioId || !data.data) {
        throw new Error("Dados inválidos para sessão");
    }

    const sessao = await prisma.sessao.create({
    data: {
        data: new Date(data.data),

        paciente: {
        connect: { id: data.pacienteId }
    },

        usuario: {
        connect: { id: data.usuarioId }
    }
    }
});

    return {
        tipo: "acao",
        message: "Sessão criada com sucesso",
        data: sessao
    };
}

// 🔥 Mapeamento das tools
export const toolMap: Record<string, Function> = {
    criar_paciente: criarPaciente,
    criar_sessao: criarSessao,
};

// 🔥 Validação
export function validarTool(parsed: any) {
    const tool = tools.find((t) => t.name === parsed.action);
    if (!tool) return false;

    for (const key of Object.keys(tool.parameters)) {
    if (!(key in parsed.data)) return false;
}

    return true;
}