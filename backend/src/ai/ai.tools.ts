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
    let textoLower = texto.toLowerCase();

    // 1. Tenta encontrar datas no formato YYYY-MM-DD
    const yyyymmddMatch = textoLower.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (yyyymmddMatch) {
        const ano = Number(yyyymmddMatch[1]);
        const mes = Number(yyyymmddMatch[2]) - 1; // 0-indexed no JS
        const dia = Number(yyyymmddMatch[3]);
        data.setFullYear(ano, mes, dia);
        // Remove a data encontrada do texto para não interferir no parsing da hora
        textoLower = textoLower.replace(yyyymmddMatch[0], "");
    } else {
        // 2. Tenta encontrar datas no formato DD/MM/YYYY ou DD/MM/YY
        const ddmmyyyyMatch = textoLower.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})/);
        if (ddmmyyyyMatch) {
            const dia = Number(ddmmyyyyMatch[1]);
            const mes = Number(ddmmyyyyMatch[2]) - 1; // 0-indexed no JS
            let ano = Number(ddmmyyyyMatch[3]);
            if (ano < 100) {
                // assume século 21 para anos de 2 dígitos
                ano += 2000;
            }
            data.setFullYear(ano, mes, dia);
            textoLower = textoLower.replace(ddmmyyyyMatch[0], "");
        } else {
            // 3. Tenta encontrar datas no formato DD/MM (sem o ano, assume ano atual)
            const ddmmMatch = textoLower.match(/(\d{1,2})[/-](\d{1,2})/);
            if (ddmmMatch) {
                const dia = Number(ddmmMatch[1]);
                const mes = Number(ddmmMatch[2]) - 1; // 0-indexed no JS
                data.setMonth(mes, dia);
                textoLower = textoLower.replace(ddmmMatch[0], "");
            } else {
                // 4. Lógica para dias relativos
                if (textoLower.includes("amanhã") || textoLower.includes("amanha")) {
                    data.setDate(data.getDate() + 1);
                } else if (textoLower.includes("depois de amanhã") || textoLower.includes("depois de amanha")) {
                    data.setDate(data.getDate() + 2);
                } else if (textoLower.includes("hoje")) {
                    // mantém hoje
                }
            }
        }
    }

    // Lógica para horas (ex: 12:00, 12h, as 12, 12:30)
    const horaMatch = textoLower.match(/(\d{1,2})(?:[:h](\d{2}))?/);

    if (horaMatch) {
        let hora = Number(horaMatch[1]);
        const minuto = Number(horaMatch[2] || 0);

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
