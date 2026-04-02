import request from 'supertest';
import app from '../../app';
import * as aiService from '../../ai/ai.service';

// Mock da função chatAssistente
jest.spyOn(aiService, 'chatAssistente').mockImplementation(async (mensagem) => {
    return "Resposta da IA enviada com sucesso!";
});

describe('POST /ai/chat', () => {
    it('Deve enviar mensagem para IA e receber resposta', async () => {
        const response = await request(app)
            .post('/ai/chat')
            .send({ mensagem: 'Olá, IA! Como você está?' });

        expect(response.status).toBe(201);
        expect(response.body.resposta).toBe('Resposta da IA enviada com sucesso!');
    });
});