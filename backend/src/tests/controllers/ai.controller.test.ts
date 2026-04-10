import request from "supertest";
import app from "../../app";

// Mock do cliente Ollama
jest.mock("../../ai/ollama.client", () => ({
    chamarOllamaComIA: jest.fn().mockResolvedValue("Resposta mockada")
}));

import * as ollamaClient from "../../ai/ollama.client";

describe("Testando endpoints IA", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Resumo deve chamar a IA", async () => {
        const response = await request(app)
        .post("/ai/resumo")
        .send({ texto: "Teste de sessão" });

        expect(response.status).toBe(200);
        expect(ollamaClient.chamarOllamaComIA).toHaveBeenCalled();
    });

    it("Relatório deve chamar a IA", async () => {
        const response = await request(app)
        .post("/ai/relatorio")
        .send({ texto: "Texto da sessão" });

        expect(response.status).toBe(200);
        expect(ollamaClient.chamarOllamaComIA).toHaveBeenCalled();
    });

    it("Sentimento deve chamar a IA", async () => {
        const response = await request(app)
        .post("/ai/sentimento")
        .send({ texto: "Paciente ansioso" });

        expect(response.status).toBe(200);
        expect(ollamaClient.chamarOllamaComIA).toHaveBeenCalled();
    });

    it("Plano terapêutico deve chamar a IA", async () => {
        const response = await request(app)
        .post("/ai/plano")
        .send({ texto: "Contexto do paciente" });

        expect(response.status).toBe(200);
        expect(ollamaClient.chamarOllamaComIA).toHaveBeenCalled();
    });

    it("Perguntas deve chamar a IA", async () => {
        const response = await request(app)
        .post("/ai/perguntas")
        .send({ texto: "Contexto da sessão" });

        expect(response.status).toBe(200);
        expect(ollamaClient.chamarOllamaComIA).toHaveBeenCalled();
    });

    it("Chat deve chamar a IA", async () => {
        const response = await request(app)
            .post("/ai/chat")
            .send({ mensagem: "Olá IA!" });

        expect(response.status).toBe(200);
        expect(ollamaClient.chamarOllamaComIA).toHaveBeenCalled();
    });

});