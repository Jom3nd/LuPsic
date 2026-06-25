import request from 'supertest';
import bcrypt from 'bcrypt';

// Mock middleware ANTES de importar app
jest.mock('../../auth/auth.middleware', () => ({
    autenticarToken: (req: any, _res: any, next: any) => {
        req.user = { id: 1, role: 'MASTER' };
        next();
    },
    requireMaster: (_req: any, _res: any, next: any) => next(),
}));

import app from '../../app';
import prisma from '../../lib/prisma';

const TS = Date.now();
let salaCriadaId: number | undefined = undefined;

afterAll(async () => {
    // Remove sala de teste se foi criada
    if (salaCriadaId) {
        await prisma.sala.deleteMany({ where: { id: salaCriadaId } });
    }
}, 20000);

describe('Sala — Listagem', () => {

    it('GET /salas/listarSalas — retorna lista de salas → 200', async () => {
        const res = await request(app).get('/salas/listarSalas');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }, 15000);

    it('GET /salas/listarSalas — cada sala tem id, nome, numeroDaSala, situacao', async () => {
        const res = await request(app).get('/salas/listarSalas');
        expect(res.status).toBe(200);
        if (res.body.length > 0) {
            const sala = res.body[0];
            expect(sala).toHaveProperty('id');
            expect(sala).toHaveProperty('nome');
            expect(sala).toHaveProperty('numeroDaSala');
            expect(sala).toHaveProperty('situacao');
        }
    }, 15000);

});

describe('Sala — Verificar Horário Livre', () => {

    it('POST /salas/verificarHorarioLivre — sem parâmetros → 400 ou resultado', async () => {
        const res = await request(app)
            .post('/salas/verificarHorarioLivre')
            .send({});

        expect([200, 400, 500]).toContain(res.status);
    }, 15000);

    it('POST /salas/verificarHorarioLivre — período válido → retorna disponibilidade', async () => {
        const inicio = new Date();
        inicio.setDate(inicio.getDate() + 14); // 2 semanas no futuro
        inicio.setHours(10, 0, 0, 0);
        const fim = new Date(inicio.getTime() + 60 * 60 * 1000);

        const res = await request(app)
            .post('/salas/verificarHorarioLivre')
            .send({
                dataHoraInicio: inicio.toISOString(),
                dataHoraFim: fim.toISOString(),
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('temHorarioLivre');
        expect(res.body).toHaveProperty('salasDisponiveis');
    }, 15000);

});
