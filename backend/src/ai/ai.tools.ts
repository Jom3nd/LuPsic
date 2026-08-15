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

import { criarPaciente as criarPacienteService } from "../paciente/paciente.service";

/** Dados necessários para criar paciente via IA */
interface CriarPacienteData {
    nome: string;
    idade: number;
}

/** Dados necessários para criar sessão via IA */
interface CriarSessaoData {
    pacienteId: number;
    dataTexto: string;
}

/** Resultado padronizado de execução de tool */
export interface ToolActionResult {
    tipo: "acao" | "erro";
    message?: string;
    data?: Record<string, unknown>;
}

/** Ação parseada da IA */
export interface ParsedAction {
    action: string;
    data: Record<string, unknown>;
}

/** Type guard para CriarPacienteData */
function isCriarPacienteData(data: Record<string, unknown>): data is CriarPacienteData & Record<string, unknown> {
    return typeof data.nome === "string" && (typeof data.idade === "number" || typeof data.idade === "string");
}

/** Type guard para CriarSessaoData */
function isCriarSessaoData(data: Record<string, unknown>): data is CriarSessaoData & Record<string, unknown> {
    return (typeof data.pacienteId === "number" || typeof data.pacienteId === "string") && typeof data.dataTexto === "string";
}

// Funções reais (execução)
export async function criarPaciente(data: Record<string, unknown>, userId: number): Promise<ToolActionResult> {
    if (!isCriarPacienteData(data)) {
        throw new Error("Dados inválidos para paciente");
    }

    const email = `${String(data.nome).toLowerCase().replace(/\s+/g, "")}.${Date.now()}@mindful.com`;
    const paciente = await criarPacienteService({
        nome: String(data.nome),
        idade: Number(data.idade),
        email,
    }, userId);

    return {
        tipo: "acao",
        message: "Paciente criado com sucesso",
        data: paciente as unknown as Record<string, unknown>,
    };
}

export async function criarSessao(data: Record<string, unknown>, userId: number): Promise<ToolActionResult> {
    if (!isCriarSessaoData(data)) {
        throw new Error("Dados inválidos para sessão");
    }

    const paciente = await prisma.paciente.findFirst({
        where: {
            id: Number(data.pacienteId),
            profissionalId: userId
        },
        include: {
            usuario: true
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
        message: `Sessão agendada para ${paciente.usuario?.nome || "Paciente"} em ${dataConvertida.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`,
        data: sessao as unknown as Record<string, unknown>
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
        const hora = Number(horaMatch[1]);
        const minuto = Number(horaMatch[2] || 0);

        data.setHours(hora, minuto, 0, 0);
    } else {
        data.setHours(9, 0, 0, 0); // Default 9h
    }

    return data;
}


/** Tipo da função de execução de tool */
type ToolExecutor = (data: Record<string, unknown>, userId: number) => Promise<ToolActionResult>;

// Mapeamento das tools
export const toolMap: Record<string, ToolExecutor> = {
    criar_paciente: criarPaciente,
    criar_sessao: criarSessao,
};

// Validação
export function validarTool(parsed: ParsedAction): boolean {
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
