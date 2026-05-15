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
        dataTexto: "string"
    }
}
];

// Funções reais (execução)
export async function criarPaciente(data: any, userId: number) {
    if (!data.nome || data.idade == null) { // idade pode ser 0, então verificamos null ou undefined
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

    if (data.pacienteId == null || !data.dataTexto) {
        throw new Error("Dados inválidos para sessão");
    }

    const paciente = await prisma.paciente.findFirst({
        where: {
            id: Number(data.pacienteId),
            usuarioId: userId
        }
    });

    if (!paciente) {
        throw new Error("Paciente não encontrado");
    }

    const dataConvertida = converterDataNatural(data.dataTexto);

    const sessao = await prisma.sessao.create({
        data: {
            dataHoraInicio: dataConvertida,

            paciente: {
                connect: { id: Number(data.pacienteId) }
            },

            usuario: {
                connect: { id: userId }
            }
        }
    });

    return {
        tipo: "acao",
        message: `Sessão agendada para ${paciente.name} em ${dataConvertida.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`,
        data: sessao
    };
}

function converterDataNatural(texto: string): Date {
    const data = new Date();
    const textoLower = texto.toLowerCase();

    // Lógica para dias
    if (textoLower.includes("amanhã")) {
        data.setDate(data.getDate() + 1);
    } else if (textoLower.includes("depois de amanhã")) {
        data.setDate(data.getDate() + 2);
    } else if (textoLower.includes("hoje")) {
        // mantém hoje
    }

    // Lógica para horas (ex: 12:00, 12h, as 12, 12:30)
    const horaMatch = textoLower.match(/(\d{1,2})(?:[:h](\d{2}))?/);

    if (horaMatch) {
        let hora = Number(horaMatch[1]);
        const minuto = Number(horaMatch[2] || 0);

        // Se o usuário disser "as 2" e for tarde, podemos assumir 14h? 
        // Por enquanto, vamos manter o que for dito.
        data.setHours(hora, minuto, 0, 0);
    } else {
        data.setHours(9, 0, 0, 0); // Default 9h
    }

    return data;
}


// Mapeamento das tools
export const toolMap: Record<string, Function> = {
    criar_paciente: criarPaciente,
    criar_sessao: criarSessao,
};

// Validação
export function validarTool(parsed: any) {
    const tool = tools.find(t => t.name === parsed.action);

    if (!tool) {
        console.log("Tool inexistente");
        return false;
    }

    for (const key of Object.keys(tool.parameters)) {
        if (!parsed.data || !(key in parsed.data)) {
            console.log("Campo faltando:", key);
            return false;
        }
    }

    return true;
}
