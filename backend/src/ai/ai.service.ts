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

// interpretação com Phi-3
async function interpretarComPhi(mensagem: string) {
    const prompt = gerarPromptInterpretacao(mensagem);
    return await chamarOllamaComIA("phi3", prompt);
}

// resposta com LLaMA 3
async function responderComLlama(mensagem: string) {
    const prompt = `
Você é um assistente clínico para psicólogos.

Responda de forma clara, profissional e objetiva.

Mensagem:
${mensagem}
`;

    return await chamarOllamaComIA("llama3", prompt);
}

// executar ação com segurança
async function executarAcao(parsed: any) {
    if (!validarTool(parsed)) {
    return {
        tipo: "erro",
        message: "Parâmetros inválidos",
    };
}

    const action = toolMap[parsed.action];

    if (!action) {
        return {
        tipo: "erro",
        message: "Ação não reconhecida",
    };
}

    try {
        return await action(parsed.data);
    } catch (error: any) {
    return {
        tipo: "erro",
        message: error.message || "Erro ao executar ação",
        };
    }
}
export async function processarIA(mensagem: string) {
    // interpretar comando
    const interpretacao = await interpretarComPhi(mensagem);

    let parsed;

    try {
        parsed = JSON.parse(interpretacao);
    } catch {
    // fallback → resposta direta
    const resposta = await responderComLlama(mensagem);

    return {
        tipo: "resposta",
        conteudo: resposta,
        };
    }

  // executar ação (se houver)
    if (parsed.action && parsed.action !== "responder") {
    const resultado = await executarAcao(parsed);

    return {
        tipo: "acao",
        conteudo: resultado.message,
        data: resultado.data || null
    };
}

  // resposta normal
    const resposta = await responderComLlama(mensagem);

    return {
        tipo: "resposta",
        conteudo: resposta,
    };
}