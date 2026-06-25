import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';

const TS = Date.now();
const EMAIL_PROF = `auth_test_prof_${TS}@lupsitest.com`;
const EMAIL_PAC  = `auth_test_pac_${TS}@lupsitest.com`;
const SENHA      = 'Senha@Test1!';

let usuarioProfId: number;
let usuarioPacId: number;
let refreshTokenSalvo: string;

function getCookieValue(res: any, name: string): string | undefined {
    const cookies = res.headers['set-cookie'];
    if (!cookies) return undefined;
    for (const cookie of cookies) {
        if (cookie.startsWith(`${name}=`)) {
            return cookie.split(';')[0].split('=')[1];
        }
    }
    return undefined;
}

beforeAll(async () => {
    // Cria profissional diretamente no banco (rota de registro exige MASTER)
    const hash = await bcrypt.hash(SENHA, 10);
    const prof = await prisma.usuario.create({
        data: { nome: 'Prof Auth Test', email: EMAIL_PROF, senha: hash, role: 'PROFISSIONAL' }
    });
    usuarioProfId = prof.id;
});

afterAll(async () => {
    if (usuarioPacId) {
        await prisma.paciente.deleteMany({ where: { usuarioId: usuarioPacId } });
        await prisma.refreshToken.deleteMany({ where: { usuarioId: usuarioPacId } });
        await prisma.usuario.deleteMany({ where: { id: usuarioPacId } });
    }
    if (usuarioProfId) {
        await prisma.refreshToken.deleteMany({ where: { usuarioId: usuarioProfId } });
        await prisma.usuario.deleteMany({ where: { id: usuarioProfId } });
    }
});

describe('Auth — Login e Tokens', () => {

    it('POST /auth/login — login válido retorna access + refresh token via cookies', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: EMAIL_PROF, senha: SENHA });

        expect(res.status).toBe(200);
        
        const accessToken = getCookieValue(res, 'accessToken');
        const refreshToken = getCookieValue(res, 'refreshToken');
        
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        
        if (refreshToken) {
            refreshTokenSalvo = refreshToken;
        }
    }, 15000);

    it('POST /auth/login — senha incorreta retorna 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: EMAIL_PROF, senha: 'SenhaErrada@1' });

        expect(res.status).toBe(400);
    }, 15000);

    it('POST /auth/login — email inexistente retorna 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'naoexiste_lupsitest@nowhere.com', senha: SENHA });

        expect(res.status).toBe(400);
    }, 15000);

    it('POST /auth/refresh — renova access token com refresh válido', async () => {
        if (!refreshTokenSalvo) return;
        const res = await request(app)
            .post('/auth/refresh')
            .set('Cookie', [`refreshToken=${refreshTokenSalvo}`]);

        expect(res.status).toBe(200);
        const accessToken = getCookieValue(res, 'accessToken');
        expect(accessToken).toBeDefined();
    }, 15000);

    it('POST /auth/refresh — token inválido retorna erro', async () => {
        const res = await request(app)
            .post('/auth/refresh')
            .set('Cookie', ['refreshToken=token_invalido_qualquer']);

        expect(res.status).toBeGreaterThanOrEqual(400);
    }, 15000);

    it('POST /auth/logout — faz logout com sucesso', async () => {
        if (!refreshTokenSalvo) return;
        const res = await request(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${refreshTokenSalvo}`]);

        expect(res.status).toBe(200);
    }, 15000);

});

describe('Auth — Registro de Paciente', () => {

    it('POST /auth/registrar/paciente — registra paciente', async () => {
        const res = await request(app)
            .post('/auth/registrar/paciente')
            .send({ nome: 'Paciente Auth Test', email: EMAIL_PAC, senha: SENHA, idade: 25 });

        expect([200, 201]).toContain(res.status);
        if (res.body.paciente && res.body.paciente.usuarioId) {
            usuarioPacId = res.body.paciente.usuarioId;
        }
    }, 15000);

    it('POST /auth/registrar/paciente — email duplicado retorna 400', async () => {
        const res = await request(app)
            .post('/auth/registrar/paciente')
            .send({ nome: 'Paciente Dup', email: EMAIL_PAC, senha: SENHA, idade: 25 });

        expect(res.status).toBe(400);
    }, 15000);

    it('POST /auth/login/paciente — login de paciente válido', async () => {
        const res = await request(app)
            .post('/auth/login/paciente')
            .send({ email: EMAIL_PAC, senha: SENHA });

        expect(res.status).toBe(200);
        const accessToken = getCookieValue(res, 'accessToken');
        expect(accessToken).toBeDefined();
    }, 15000);

});
