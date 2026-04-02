import { chamarOllama } from "./ollama.client";

function escolherModelo(tipo: string) {
    switch (tipo) {
        case "chat":
        case "perguntas":
            return "phi3";

        case "resumo":
        case "relatorio":
        case "sentimento":
        case "plano":
            return "llama3";

        default:
            return "phi3";
    }
}

function montarPrompt(tipo: string, texto: string) {
    let instrucao = "";

    switch (tipo) {
        case "resumo":
            instrucao = "Faça um resumo clínico da sessão.";
            break;

        case "relatorio":
            instrucao = `
            Gere um relatório psicológico contendo:
            - Resumo
            - Comportamentos observados
            - Emoções relatadas
            - Possíveis intervenções
            `;
            break;

        case "sentimento":
            instrucao = `
            Analise o estado emocional do paciente e classifique como:
            Ansiedade, Tristeza, Raiva, Medo ,Neutro , Alegre.
            `;
            break;

        case "perguntas":
            instrucao = "Sugira perguntas terapêuticas para a próxima sessão.";
            break;

        case "plano":
            instrucao = `
            Crie um plano terapêutico contendo:
            - Objetivos
            - Técnicas sugeridas
            - Exercícios
            - Frequência das sessões
            `;
            break;

        case "chat":
            instrucao = "Responda como um assistente clínico para psicólogos.";
            break;

        default:
            instrucao = "Responda como assistente clínico.";
    }

    return `
    Você é um assistente para psicólogos.
    Atue como um Consultor de Apoio Clínico para Psicólogos.
    Seu papel é auxiliar na organização de casos, fundamentação teórica e estruturação de intervenções.

    ${instrucao}

    Texto:
    ${texto}
    `;
}

export async function processarIA(tipo: string, texto: string) {
    const model = escolherModelo(tipo);
    const prompt = montarPrompt(tipo, texto);

    return await chamarOllama(model, prompt);
}