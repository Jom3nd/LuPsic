import { chamarOllamaComIA } from "./ollama.client";
import { tools, toolMap, validarTool } from "./ai.tools";
import prisma from "../lib/prisma";

function gerarPromptInterpretacao(mensagem: string, pacientes: any[], dataAtual: string) {
    const listaPacientes = pacientes.map(p => `- ID: ${p.id}, Nome: ${p.name}`).join("\n");

    return `
Data e hora atual: ${dataAtual}

Lista de pacientes cadastrados:
${listaPacientes || "Nenhum paciente cadastrado."}

Você é um interpretador de comandos clínicos. Analise a mensagem do usuário e identifique TODAS as ações desejadas.

Ações possíveis:
${JSON.stringify(tools, null, 2)}

REGRAS:
1. Se o usuário pedir mais de uma coisa (ex: criar paciente E agendar sessão), retorne todas as ações na lista "actions".
2. Para "criar_sessao", se o paciente acabou de ser mencionado para criação na mesma mensagem mas ainda não tem ID real, use "pacienteId": 0.
3. Retorne SEMPRE um JSON no formato:
{
    "actions": [
        { "action": "nome_da_acao", "data": {} }
    ]
}

Se não houver ação clara, use:
{
    "actions": [
        { "action": "responder", "data": {} }
    ]
}

Mensagem do Usuário: ${mensagem}
`;
}


async function interpretarComQwen(mensagem: string, pacientes: any[], dataAtual: string) {
    const prompt = gerarPromptInterpretacao(mensagem, pacientes, dataAtual);
    return await chamarOllamaComIA("qwen2.5-coder:7b", prompt);
}

async function responderComLlama(mensagem: string) {
    const prompt = `
Você é um assistente clínico para psicólogos.

Responda de forma clara, profissional e objetiva.

Mensagem:
${mensagem}
`;

    return await chamarOllamaComIA("llama3", prompt);
}

async function executarAcao(parsed: any, userId: number) {
    if (!validarTool(parsed)) {
        return {
            tipo: "erro",
            message: "Parâmetros inválidos",
        };
    }

    if (!userId) {
        return {
            tipo: "erro",
            message: "Usuário não autenticado",
        };
    }

    const action = toolMap[parsed.action];

    if (!action) {
        return {
            tipo: "erro",
            message: "Ação não reconhecida",
        };
    }

    if (parsed.action === "criar_sessao") {
        if (parsed.data.pacienteId === 0) {
            return { tipo: "erro", message: "Paciente não encontrado. Por favor, cadastre o paciente primeiro ou verifique o nome." };
        }
        
        if (!parsed.data.pacienteId) {
            return { tipo: "erro", message: "ID do paciente não informado" };
        }
    }

    try {
        return await action(parsed.data, userId);
    } catch (error: any) {
        return {
            tipo: "erro",
            message: error.message || "Erro ao executar ação",
        };
    }
}

export async function processarIA(mensagem: string, userId: number) {
    // Buscar pacientes do profissional para dar contexto à IA
    const pacientesRaw = await prisma.paciente.findMany({
        where: { profissionalId: userId },
        include: {
            usuario: {
                select: { nome: true }
            }
        }
    });

    const pacientes = pacientesRaw.map(p => ({
        id: p.id,
        name: p.usuario?.nome || "Sem Nome"
    }));

    const dataAtual = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    const interpretacao = await interpretarComQwen(mensagem, pacientes, dataAtual);

    let parsed;

    try {
        // Garantir que é string antes de limpar
        const rawString = typeof interpretacao === "string" ? interpretacao : JSON.stringify(interpretacao);

        const clean = rawString // remove as marcações de código na resposta da IA
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        parsed = JSON.parse(clean);
    } catch (error) {
        console.error("Erro ao processar JSON da IA:", error);
        const resposta = await responderComLlama(mensagem);

        return {
            tipo: "resposta",
            conteudo: resposta,
        };
    }

    // Se não houver array de ações, tenta converter formato antigo para o novo
    const actions = parsed.actions || (parsed.action ? [parsed] : []);

    if (actions.length === 0 || (actions.length === 1 && actions[0].action === "responder")) {
        const resposta = await responderComLlama(mensagem);
        return { tipo: "resposta", conteudo: resposta };
    }

    const resultados = [];
    let ultimoPacienteCriadoId = null;

    for (const item of actions) {
        // Se for criar sessão e o pacienteId for 0 (indicando que acabou de ser criado no mesmo comando)
        if (item.action === "criar_sessao" && item.data.pacienteId === 0 && ultimoPacienteCriadoId) {
            item.data.pacienteId = ultimoPacienteCriadoId;
        }

        const resultado = await executarAcao(item, userId);
        
        if (resultado.tipo !== "erro") {
            resultados.push(resultado.message);
            // Salva o ID se um paciente foi criado para usar na próxima ação do loop
            if (item.action === "criar_paciente" && resultado.data?.id) {
                ultimoPacienteCriadoId = resultado.data.id;
            }
        } else {
            resultados.push(`Erro em ${item.action}: ${resultado.message}`);
        }
    }

    return {
        tipo: "acao",
        conteudo: resultados.join(" | "),
        data: actions
    };
}