import openai from "../lib/openai";

export async function perguntarIA(mensagem: string) {
    const resposta = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "Você é um assistente para psicólogos.Atue como um Consultor de Apoio Clínico para Psicólogos. Seu papel é auxiliar na organização de casos, fundamentação teórica e estruturação de intervenções" },
            { role: "user", content: mensagem }
    ],
});

    return resposta.choices[0].message.content;
}
export async function resumirSessao(textoSessao: string) {
    const prompt = `
    Resuma a seguinte sessão psicológica de forma profissional e objetiva:
    ${textoSessao}
`;

    return await perguntarIA(prompt);
}

// 2. Gerar relatório psicológico
export async function gerarRelatorio(textoSessao: string) {
    const prompt = `
    Gere um relatório psicológico profissional baseado na seguinte sessão:
    ${textoSessao}

    O relatório deve conter:
    - Resumo
    - Comportamentos observados
    - Emoções relatadas
    - Possíveis intervenções
    `;

    return await perguntarIA(prompt);
}

// 3. Analisar sentimento do paciente
export async function analisarSentimento(texto: string) {
    const prompt = `
    Analise o sentimento do paciente no texto abaixo e diga se é:
    - Ansiedade
    - Tristeza
    - Raiva
    - Medo
    - Neutro

    Texto:
    ${texto}
    `;

    return await perguntarIA(prompt);
}

// 4. Sugerir perguntas terapêuticas
export async function sugerirPerguntas(contexto: string) {
    const prompt = `
    Baseado no contexto da sessão abaixo, sugira perguntas terapêuticas que o psicólogo pode fazer na próxima sessão:

    ${contexto}
    `;

    return await perguntarIA(prompt);
}

// 5. Gerar plano terapêutico
export async function gerarPlanoTerapeutico(contexto: string) {
    const prompt = `
    Crie um plano terapêutico com base no caso abaixo:

    ${contexto}

    O plano deve conter:
    - Objetivos
    - Técnicas sugeridas
    - Exercícios
    - Frequência das sessões
    `;

    return await perguntarIA(prompt);
}

// 6. Chat assistente
export async function chatAssistente(mensagem: string) {
    const prompt = `
    Responda como um assistente para psicólogos:

    ${mensagem}
    `;

    return await perguntarIA(prompt);
}