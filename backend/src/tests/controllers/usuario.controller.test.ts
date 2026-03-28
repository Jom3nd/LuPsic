import request from 'supertest';
import app from '../../app';

describe('POST /usuarios', () => {

    it('deve criar um usuário', async () => {
    const response = await request(app)
        .post('/usuarios')
        .send({
        nome: 'João',
        email: `joao${Date.now()}@email.com`,
        senha: '123456',
});

    expect(response.status).toBe(201);
    expect(response.body.nome).toBe('João');
    });

    it('deve retornar erro se nome estiver faltando', async () => {
    const response = await request(app)
        .post('/usuarios')
        .send({
            email: 'teste@email.com',
            senha: '123456',
        });

    expect(response.status).toBe(400);
    });

    it('deve retornar erro se email estiver faltando', async () => {
    const response = await request(app)
        .post('/usuarios')
        .send({
        nome: 'Teste',
        senha: '123456',
        });

    expect(response.status).toBe(400);
    });

    it('deve retornar erro se senha estiver faltando', async () => {
    const response = await request(app)
        .post('/usuarios')
        .send({
            nome: 'Teste',
            email: 'teste@email.com',
    });

    expect(response.status).toBe(400);
    });

    it('deve retornar erro se email já existir', async () => {
    const email = `repetido${Date.now()}@email.com`;

    await request(app).post('/usuarios').send({
        nome: 'Teste',
        email,
        senha: '123456',
    });

    const response = await request(app).post('/usuarios').send({
        nome: 'Teste',
        email,
        senha: '123456',
    });

    expect(response.status).toBe(400);
});

});