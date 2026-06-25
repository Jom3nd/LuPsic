import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mocks ANTES de importar app
jest.mock('../../auth/auth.middleware', () => ({
    autenticarToken: (req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
    },
    requireMaster: (_req: any, _res: any, next: any) => next(),
}));

import app from '../../app';
import prisma from '../../lib/prisma';

const TS = Date.now();

// Usuário mockado que será injetado via middleware
let mockUser: { id: number; role: string; email: string } = {
    id: 0,
    role: 'PACIENTE',
    email: `agend_pac_${TS}@lupsitest.com`,
};

// IDs criados durante os testes
let profissionalId: number;
let pacienteUsuarioId: number;
let pacienteId: number;
let salaId: number;
let agendamentoId: number;

beforeAll(async () => {
    const hash = await bcrypt.hash('Senha@Test1!', 10);

    // Cria profissional
    const prof = await prisma.usuario.create({
        data: { nome: 'Prof Agend Test', email: `agend_prof_${TS}@lupsitest.com`, senha: hash, role: 'PROFISSIONAL' }
    });
    profissionalId = prof.id;

    // Cria paciente (usuário + perfil)
    const pacUsr = await prisma.usuario.create({
        data: { nome: 'Pac Agend Test', email: `agend_pac_${TS}@lupsitest.com`, senha: hash, role: 'PACIENTE' }
    });
    pacienteUsuarioId = pacUsr.id;
    const pac = await prisma.paciente.create({
        data: { idade: 30, usuarioId: pacUsr.id, profissionalId: prof.id }
    });
    pacienteId = pac.id;

    // Garante que não há salas de teste residuais com número ou nome conflitantes
    await prisma.sala.deleteMany({
        where: {
            OR: [
                { numeroDaSala: 9999 },
                { nome: `Sala Teste ${TS}` },
                { nome: 'Sala Teste 9999' }
            ]
        }
    });

    const sala = await prisma.sala.create({
        data: { id: 9999, nome: `Sala Teste ${TS}`, numeroDaSala: 9999 }
    });
    salaId = sala.id;

    // Configura o mock para o ID do paciente
    mockUser = { id: pacienteUsuarioId, role: 'PACIENTE', email: pacUsr.email };
}, 30000);

afterAll(async () => {
    // Limpa na ordem correta (dependências primeiro)
    if (agendamentoId) {
        await prisma.agendamento.deleteMany({ where: { id: agendamentoId } });
    }
    if (pacienteId) {
        await prisma.agendamento.deleteMany({ where: { pacienteId } });
        await prisma.paciente.deleteMany({ where: { id: pacienteId } });
    }
    if (pacienteUsuarioId) {
        await prisma.usuario.deleteMany({ where: { id: pacienteUsuarioId } });
    }
    if (salaId) {
        await prisma.sala.deleteMany({ where: { id: salaId } });
    }
    if (profissionalId) {
        await prisma.agendamento.deleteMany({ where: { usuarioId: profissionalId } });
        await prisma.usuario.deleteMany({ where: { id: profissionalId } });
    }
}, 30000);

// Helpers de data/hora
function buildISO(hour: number, minute = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + 7); // uma semana no futuro
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

describe('Agendamento — Validação de Horário', () => {

    it('POST /agendamentos — dentro do horário (08:00) → 201', async () => {
        const res = await request(app)
            .post('/agendamentos')
            .send({
                dataHoraInicio: buildISO(8),
                dataHoraFim: buildISO(9),
                usuarioId: profissionalId,
                salaId,
                observacao: 'Teste dentro horário',
            });

        expect(res.status).toBe(201);
        agendamentoId = res.body.id;
    }, 15000);

    it('POST /agendamentos — antes das 07:00 (06:00) → 400', async () => {
        const res = await request(app)
            .post('/agendamentos')
            .send({
                dataHoraInicio: buildISO(6),
                dataHoraFim: buildISO(7),
                usuarioId: profissionalId,
                salaId,
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/07:00.*20:00|fora.*horário|permitidos/i);
    }, 15000);

    it('POST /agendamentos — depois das 20:00 (21:00) → 400', async () => {
        const res = await request(app)
            .post('/agendamentos')
            .send({
                dataHoraInicio: buildISO(21),
                dataHoraFim: buildISO(22),
                usuarioId: profissionalId,
                salaId,
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/07:00.*20:00|fora.*horário|permitidos/i);
    }, 15000);

    it('POST /agendamentos — exatamente às 07:00 → 400 (conflito ou sucesso dependendo de dados)', async () => {
        const res = await request(app)
            .post('/agendamentos')
            .send({
                dataHoraInicio: buildISO(7),
                dataHoraFim: buildISO(8),
                usuarioId: profissionalId,
                salaId,
            });

        // 201 (criado) ou 400 (conflito de profissional com o slot 08:00 criado antes)
        // Em ambos os casos, não pode ser erro de horário
        if (res.status === 400) {
            expect(res.body.error).not.toMatch(/permitidos apenas das 07:00/i);
        } else {
            expect(res.status).toBe(201);
            // Limpa este agendamento extra
            await prisma.agendamento.deleteMany({ where: { id: res.body.id } });
        }
    }, 15000);

    it('POST /agendamentos — término além das 20:00 → 400', async () => {
        const res = await request(app)
            .post('/agendamentos')
            .send({
                dataHoraInicio: buildISO(19, 30),
                dataHoraFim: buildISO(20, 30), // termina às 20:30
                usuarioId: profissionalId,
                salaId,
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/20:00/i);
    }, 15000);

});

describe('Agendamento — Conflitos', () => {

    it('POST /agendamentos — conflito de sala → 400', async () => {
        // Tenta criar no mesmo horário do agendamento já existente (08:00-09:00)
        const res = await request(app)
            .post('/agendamentos')
            .send({
                dataHoraInicio: buildISO(8),
                dataHoraFim: buildISO(9),
                usuarioId: profissionalId,
                salaId,
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/conflito|ocupado|agendamento|profissional/i);
    }, 15000);

});

describe('Agendamento — Listagem', () => {

    it('GET /agendamentos — retorna lista', async () => {
        const res = await request(app).get('/agendamentos');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }, 15000);

});

describe('Agendamento — Atualizar Status', () => {

    it('PATCH /agendamentos/:id/status — paciente não pode alterar status → 403', async () => {
        if (!agendamentoId) return;
        const res = await request(app)
            .patch(`/agendamentos/${agendamentoId}/status`)
            .send({ status: 'CONFIRMADO' });

        // PACIENTE não tem permissão — espera 403
        expect(res.status).toBe(403);
    }, 15000);

    it('PATCH /agendamentos/:id/status — FUNCIONARIO pode confirmar → 200', async () => {
        if (!agendamentoId) return;
        // Simula FUNCIONARIO
        mockUser = { ...mockUser, role: 'FUNCIONARIO' };
        const res = await request(app)
            .patch(`/agendamentos/${agendamentoId}/status`)
            .send({ status: 'CONFIRMADO' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('CONFIRMADO');
    }, 15000);

});
