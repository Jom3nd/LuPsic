import { chamarOllamaComIA } from "./ollama.client";
import { tools, toolMap, validarTool } from "./ai.tools";

function gerarPromptInterpretacao(mensagem: string) {
    return `
Você é um interpretador de comandos.

Você pode executar as seguintes ações:

${JSON.stringify(tools, null, 2)}

Responda SOMENTE em JSON:

{
    "action": "nome_da_acao",
    "data": {}
}

Se não for uma ação, responda:

{
    "action": "responder",
    "data": {}
}

Usuário: ${mensagem}
`;
}

async function interpretarComPhi(mensagem: string) {
    const prompt = gerarPromptInterpretacao(mensagem);
    return await chamarOllamaComIA("phi3", prompt);
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
        if (typeof parsed.data.pacienteId !== "number") { //validação de dados por tipo de dado de entrada
            return { tipo: "erro", message: "pacienteId inválido" };
        }

        if (isNaN(new Date(parsed.data.data).getTime())) { //validação de dados por tipo de dado de entrada
            return { tipo: "erro", message: "Data inválida" };
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
    const interpretacao = await interpretarComPhi(mensagem);

    let parsed;

    try {
        const clean = interpretacao // remove as marcações de código na resposta do Phi-3
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        parsed = JSON.parse(clean);
    } catch {
        const resposta = await responderComLlama(mensagem);

        return {
            tipo: "resposta",
            conteudo: resposta,
        };
    }

    if (typeof parsed.action === "string" && parsed.action !== "responder") {
        const resultado = await executarAcao(parsed, userId);

        if (resultado.tipo === "erro") {
            return resultado;
        }

        return {
            tipo: "acao",
            conteudo: resultado.message,
            data: resultado.data || null,
        };
    }

    const resposta = await responderComLlama(mensagem);

    return {
        tipo: "resposta",
        conteudo: resposta,
    };
}