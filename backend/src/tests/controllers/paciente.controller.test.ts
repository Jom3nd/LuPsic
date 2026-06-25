import request from 'supertest';
import bcrypt from 'bcrypt';

// Mock middleware ANTES de importar app
jest.mock('../../auth/auth.middleware', () => ({
    autenticarToken: (req: any, _res: any, next: any) => {
        req.user = mockUser;
        next();
    },
    requireMaster: (_req: any, _res: any, next: any) => next(),
}));

import app from '../../app';
import prisma from '../../lib/prisma';

const TS = Date.now();

let mockUser: { id: number; role: string } = { id: 0, role: 'PROFISSIONAL' };
let profissionalId: number;
let pacienteUsuarioId: number;
let pacienteId: number;

beforeAll(async () => {
    const hash = await bcrypt.hash('Senha@Test1!', 10);
    const prof = await prisma.usuario.create({
        data: { nome: 'Prof Pac Test', email: `pac_prof_${TS}@lupsitest.com`, senha: hash, role: 'PROFISSIONAL' }
    });
    profissionalId = prof.id;
    mockUser = { id: profissionalId, role: 'PROFISSIONAL' };
}, 20000);

afterAll(async () => {
    if (pacienteId) {
        await prisma.agendamento.deleteMany({ where: { pacienteId } });
        await prisma.paciente.deleteMany({ where: { id: pacienteId } });
    }
    if (pacienteUsuarioId) {
        await prisma.usuario.deleteMany({ where: { id: pacienteUsuarioId } });
    }
    if (profissionalId) {
        await prisma.paciente.updateMany({
            where: { profissionalId },
            data: { profissionalId: null }
        });
        await prisma.usuario.deleteMany({ where: { id: profissionalId } });
    }
}, 20000);

describe('Paciente — CRUD', () => {

    it('POST /paciente — cria paciente → 201', async () => {
        const res = await request(app)
            .post('/paciente')
            .send({
                nome: 'Paciente CRUD Test',
                email: `pac_crud_${TS}@lupsitest.com`,
                senha: 'Senha@Test1!',
                idade: 28,
            });

        expect(res.status).toBe(201);
        expect(res.body.usuario?.nome || res.body.nome).toBeDefined();
        pacienteId = res.body.id;
        pacienteUsuarioId = res.body.usuarioId ?? res.body.usuario?.id;
    }, 15000);

    it('GET /paciente — lista pacientes do profissional → 200', async () => {
        const res = await request(app).get('/paciente');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }, 15000);

    it('GET /paciente/:id — busca por ID → 200', async () => {
        if (!pacienteId) return;
        const res = await request(app).get(`/paciente/${pacienteId}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(pacienteId);
    }, 15000);

    it('PUT /paciente/:id — atualiza paciente → 200', async () => {
        if (!pacienteId) return;
        const res = await request(app)
            .put(`/paciente/${pacienteId}`)
            .send({ idade: 29 });

        expect(res.status).toBe(200);
    }, 15000);

    it('GET /paciente/:id — ID inexistente → 404', async () => {
        const res = await request(app).get('/paciente/99999999');
        expect(res.status).toBe(404);
    }, 15000);

});
