import request from 'supertest';
import app from '../../app';
import * as usuarioService from '../../usuario/usuario.service';

// Injeta a rota mockada apenas no ambiente de testes
app.post('/register-profissional-mock', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const usuario = await usuarioService.criarUsuario({ nome, email, senha, role: 'PROFISSIONAL' });
        return res.status(201).json(usuario);
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro' });
    }
});

describe('POST /usuario', () => {

    it('deve criar um usuário', async () => {
    const response = await request(app)
        .post('/register')
        .send({
        nome: 'João',
        email: `joao${Date.now()}@email.com`,
        senha: '123456',
});

    expect(response.status).toBe(201);
    expect(response.body.nome).toBe('João');
    },10000);

    it('deve retornar erro se nome estiver faltando', async () => {
    const response = await request(app)
        .post('/register')
        .send({
            email: 'teste@email.com',
            senha: '123456',
        });

    expect(response.status).toBe(400);
    });

    it('deve retornar erro se email estiver faltando', async () => {
    const response = await request(app)
        .post('/register')
        .send({
        nome: 'Teste',
        senha: '123456',
        });

    expect(response.status).toBe(400);
    });

    it('deve retornar erro se senha estiver faltando', async () => {
    const response = await request(app)
        .post('/register')
        .send({
            nome: 'Teste',
            email: 'teste@email.com',
    });

    expect(response.status).toBe(400);
    });

    it('deve retornar erro se email já existir', async () => {
    const email = `repetido${Date.now()}@email.com`;

    await request(app).post('/register').send({
        nome: 'Teste',
        email,
        senha: '123456',
    });

    const response = await request(app).post('/register').send({
        nome: 'Teste',
        email,
        senha: '123456',
    });

    expect(response.status).toBe(400);
    });

    it('deve criar um profissional mockado na rota de teste', async () => {
        const response = await request(app)
            .post('/register-profissional-mock')
            .send({
                nome: 'Profissional Teste',
                email: `pro${Date.now()}@email.com`,
                senha: '123456',
            });

        expect(response.status).toBe(201);
        expect(response.body.nome).toBe('Profissional Teste');
    });

});