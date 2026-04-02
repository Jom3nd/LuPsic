// src/tests/controllers/ai.controller.test.ts
import request from 'supertest';
import app from '../../app';

// Mock completo do módulo Ollama
jest.mock('../../ai/ollama.client', () => ({
    chamarOllama: jest.fn().mockResolvedValue("Resposta mockada")
}));

import * as ollamaClient from '../../ai/ollama.client';

describe("Testando endpoints IA e escolha de modelos", () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("Resumo deve usar llama3", async () => {
        await request(app)
        .post("/ai/resumo")
        .send({ texto: "Teste de sessão" });

        expect(ollamaClient.chamarOllama).toHaveBeenCalledWith("llama3", expect.any(String));
    });

    it("Relatório deve usar llama3", async () => {
        await request(app)
        .post("/ai/relatorio")
        .send({ texto: "Texto da sessão" });

        expect(ollamaClient.chamarOllama).toHaveBeenCalledWith("llama3", expect.any(String));
    });

    it("Sentimento deve usar llama3", async () => {
    await request(app)
        .post("/ai/sentimento")
        .send({ texto: "Paciente ansioso" });

    expect(ollamaClient.chamarOllama).toHaveBeenCalledWith("llama3", expect.any(String));
    });

    it("Plano terapêutico deve usar llama3", async () => {
        await request(app)
        .post("/ai/plano")
        .send({ texto: "Contexto do paciente" });

    expect(ollamaClient.chamarOllama).toHaveBeenCalledWith("llama3", expect.any(String));
    });

    it("Perguntas deve usar phi3", async () => {
        await request(app)
        .post("/ai/perguntas")
        .send({ texto: "Contexto da sessão" });

    expect(ollamaClient.chamarOllama).toHaveBeenCalledWith("phi3", expect.any(String));
    });

    it("Chat deve usar phi3", async () => {
        await request(app)
        .post("/ai/chat")
        .send({ mensagem: "Olá IA!" });

    expect(ollamaClient.chamarOllama).toHaveBeenCalledWith("phi3", expect.any(String));
    });

});